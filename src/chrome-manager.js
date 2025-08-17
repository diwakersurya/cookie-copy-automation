import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Chrome paths for different platforms
const CHROME_PATHS = {
  darwin: {
    canary: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    stable: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    userDataDir: process.env.HOME ? path.join(process.env.HOME, 'Library/Application Support/Google/Chrome Canary/Default') : undefined
  },
  linux: {
    canary: 'google-chrome-canary',
    stable: 'google-chrome',
    userDataDir: process.env.HOME ? path.join(process.env.HOME, '.config/google-chrome-canary/Default') : undefined
  },
  win32: {
    canary: 'C:\\Program Files\\Google\\Chrome SxS\\Application\\chrome.exe',
    stable: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    userDataDir: process.env.APPDATA ? path.join(process.env.APPDATA, 'Google/Chrome SxS/User Data/Default') : undefined
  }
};

function log(...args) {
  console.error(chalk.blue('[chrome]'), ...args);
}

function logError(...args) {
  console.error(chalk.red('[chrome-error]'), ...args);
}

function logSuccess(...args) {
  console.log(chalk.green('[chrome-success]'), ...args);
}

export class ChromeManager {
  constructor(options = {}) {
    this.port = options.port || 9222;
    this.userDataDir = options.userDataDir;
    this.platform = process.platform;
    this.chromeProcess = null;
    this.verbose = options.verbose || false;
  }

  async checkCDPConnection() {
    try {
      const response = await fetch(`http://localhost:${this.port}/json/version`);
      if (response.ok) {
        const data = await response.json();
        if (this.verbose) {
          log('CDP connection successful:', data.Browser);
        }
        return true;
      }
    } catch (error) {
      if (this.verbose) {
        log('CDP connection failed:', error.message);
      }
    }
    return false;
  }

  async findChromeExecutable() {
    const paths = CHROME_PATHS[this.platform];
    if (!paths) {
      throw new Error(`Unsupported platform: ${this.platform}`);
    }

    // Try Chrome Canary first, then stable Chrome
    const variants = [
      { name: 'Chrome Canary', path: paths.canary },
      { name: 'Chrome Stable', path: paths.stable }
    ];

    for (const variant of variants) {
      try {
        if (this.platform === 'win32') {
          // On Windows, check if file exists
          if (fs.existsSync(variant.path)) {
            return variant;
          }
        } else {
          // On Unix-like systems, check if executable exists
          await execAsync(`which "${variant.path}"`);
          return variant;
        }
      } catch (error) {
        if (this.verbose) {
          log(`${variant.name} not found at: ${variant.path}`);
        }
      }
    }

    throw new Error('No Chrome executable found. Please install Google Chrome or Chrome Canary.');
  }

  async startChrome() {
    if (await this.checkCDPConnection()) {
      logSuccess('Chrome is already running with CDP enabled');
      return true;
    }

    const chrome = await this.findChromeExecutable();
    log(`Starting ${chrome.name}...`);

    const args = [
      `--remote-debugging-port=${this.port}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      '--disable-popup-blocking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection'
    ];

    // Add user data directory if specified
    if (this.userDataDir) {
      args.push(`--user-data-dir="${this.userDataDir}"`);
    }

    // Add additional arguments for better automation
    args.push('--disable-web-security');
    args.push('--disable-features=VizDisplayCompositor');

    try {
      this.chromeProcess = spawn(chrome.path, args, {
        detached: true,
        stdio: 'ignore'
      });

      // Wait a bit for Chrome to start
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if CDP is now available
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        if (await this.checkCDPConnection()) {
          logSuccess(`${chrome.name} started successfully on port ${this.port}`);
          return true;
        }
        
        attempts++;
        if (this.verbose) {
          log(`Waiting for Chrome to start... (attempt ${attempts}/${maxAttempts})`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      throw new Error('Chrome started but CDP connection failed');
    } catch (error) {
      logError('Failed to start Chrome:', error.message);
      throw error;
    }
  }

  async stopChrome() {
    if (this.chromeProcess) {
      try {
        this.chromeProcess.kill();
        log('Chrome process stopped');
      } catch (error) {
        logError('Failed to stop Chrome process:', error.message);
      }
    }
  }

  getCDPUrl() {
    return `http://localhost:${this.port}`;
  }

  async ensureChromeRunning() {
    if (await this.checkCDPConnection()) {
      return this.getCDPUrl();
    }

    log('Chrome not running with CDP. Starting Chrome...');
    await this.startChrome();
    return this.getCDPUrl();
  }
}

export async function startChrome(options = {}) {
  const manager = new ChromeManager(options);
  return await manager.ensureChromeRunning();
}

export async function checkChromeStatus(port = 9222) {
  const manager = new ChromeManager({ port });
  return await manager.checkCDPConnection();
}

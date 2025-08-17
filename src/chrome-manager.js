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



  async findChromeExecutable() {
    const paths = CHROME_PATHS[this.platform];
    if (!paths) {
      throw new Error(`Unsupported platform: ${this.platform}`);
    }

    // Only try Chrome Canary as per requirements
    const variant = { name: 'Chrome Canary', path: paths.canary };

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

    throw new Error('Chrome Canary not found. Please install Google Chrome Canary.');
  }

  async startChrome() {
    const chrome = await this.findChromeExecutable();
    log(`Starting ${chrome.name}...`);

    // Check if port is already in use
    if (await this.isPortInUse()) {
      throw new Error(`Port ${this.port} is already in use. Please stop any existing Chrome instances or use a different port.`);
    }

    const args = [
      `--remote-debugging-port=${this.port}`
    ];

    // Add user data directory - this is required for CDP to work
    if (this.userDataDir) {
      args.push(`--user-data-dir="${this.userDataDir}"`);
    } else {
      // Use default Chrome Canary user data directory if not specified
      const defaultUserDataDir = CHROME_PATHS[this.platform]?.userDataDir;
      if (defaultUserDataDir) {
        args.push(`--user-data-dir="${defaultUserDataDir}"`);
      } else {
        // Fallback to a temporary directory
        const tempDir = path.join(process.cwd(), '.chrome-debug');
        args.push(`--user-data-dir="${tempDir}"`);
      }
    }

    if (this.verbose) {
      log(`Chrome command: ${chrome.path} ${args.join(' ')}`);
    }

    try {
      this.chromeProcess = spawn(chrome.path, args, {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'] // Capture stdout and stderr for debugging
      });

      // Store the process ID for better cleanup
      this.chromePid = this.chromeProcess.pid;

      // Set up error handling for the Chrome process
      this.chromeProcess.on('error', (error) => {
        logError('Chrome process error:', error.message);
      });

      this.chromeProcess.on('exit', (code, signal) => {
        if (code !== null) {
          logError(`Chrome process exited with code ${code}`);
        } else if (signal !== null) {
          logError(`Chrome process killed with signal ${signal}`);
        }
      });

      // Wait for Chrome to start and CDP endpoint to be ready
      await this.waitForCDPReady();

      logSuccess(`${chrome.name} started successfully on port ${this.port} (PID: ${this.chromePid})`);
      return true;
    } catch (error) {
      logError('Failed to start Chrome:', error.message);
      
      // Clean up the failed process
      if (this.chromeProcess) {
        this.chromeProcess.kill('SIGKILL');
      }
      
      throw error;
    }
  }

  async waitForCDPReady(maxAttempts = 30, delayMs = 1000) {
    log(`Waiting for Chrome CDP endpoint to be ready on port ${this.port}...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(`http://localhost:${this.port}/json/version`);
        if (response.ok) {
          const data = await response.json();
          log(`CDP endpoint ready after ${attempt} attempts`);
          log(`Chrome version: ${data.Browser || 'Unknown'}`);
          return true;
        }
      } catch (error) {
        if (this.verbose || attempt % 5 === 0) {
          log(`Attempt ${attempt}/${maxAttempts}: CDP not ready yet (${error.message})`);
        }
      }
      
      // Check if Chrome process is still running
      if (this.chromeProcess && this.chromeProcess.killed) {
        throw new Error('Chrome process died unexpectedly during startup');
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    throw new Error(`Chrome CDP endpoint failed to become ready after ${maxAttempts} attempts. Please check if Chrome Canary is properly installed and accessible.`);
  }

  async stopChrome() {
    if (this.chromeProcess || this.chromePid) {
      try {
        // Try to kill the process gracefully first
        if (this.chromeProcess) {
          this.chromeProcess.kill('SIGTERM');
        } else if (this.chromePid) {
          process.kill(this.chromePid, 'SIGTERM');
        }

        // Wait a bit for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Force kill if still running
        if (this.chromeProcess && !this.chromeProcess.killed) {
          this.chromeProcess.kill('SIGKILL');
        } else if (this.chromePid) {
          try {
            process.kill(this.chromePid, 'SIGKILL');
          } catch (e) {
            // Process might already be dead
          }
        }

        // Also try to kill any remaining Chrome processes on the same port
        if (this.platform === 'win32') {
          try {
            await execAsync(`taskkill /F /IM chrome.exe /FI "WINDOWTITLE eq *:${this.port}*" 2>nul`);
          } catch (e) {
            // Ignore errors
          }
        } else {
          try {
            await execAsync(`pkill -f "chrome.*--remote-debugging-port=${this.port}"`);
          } catch (e) {
            // Ignore errors
          }
        }

        log('Chrome process stopped');
      } catch (error) {
        logError('Failed to stop Chrome process:', error.message);
      } finally {
        this.chromeProcess = null;
        this.chromePid = null;
      }
    }
  }

  getCDPUrl() {
    return `http://localhost:${this.port}`;
  }

  async isChromeRunning() {
    if (this.chromeProcess) {
      return !this.chromeProcess.killed;
    }
    if (this.chromePid) {
      try {
        process.kill(this.chromePid, 0); // Signal 0 just checks if process exists
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  async isCDPChromeRunning() {
    try {
      // Try to connect to the CDP endpoint to see if Chrome is already running
      const response = await fetch(`http://localhost:${this.port}/json/version`);
      if (response.ok) {
        const data = await response.json();
        log(`Found existing Chrome instance: ${data.Browser || 'Unknown'}`);
        return true;
      }
    } catch (error) {
      if (this.verbose) {
        log(`No Chrome CDP instance found on port ${this.port}: ${error.message}`);
      }
    }
    return false;
  }

  async ensureChromeRunning() {
    // First check if Chrome is already running with CDP
    if (await this.isCDPChromeRunning()) {
      logSuccess(`Reusing existing Chrome instance on port ${this.port}`);
      return this.getCDPUrl();
    }

    // If no CDP Chrome is running, start Chrome Canary
    log('No Chrome CDP instance found, starting Chrome Canary...');
    
    // Try to start Chrome with the current port
    try {
      await this.startChrome();
      return this.getCDPUrl();
    } catch (error) {
      logError(`Failed to start Chrome on port ${this.port}: ${error.message}`);
      
      // Try alternative ports if the default port fails
      const alternativePorts = [9223, 9224, 9225, 9226, 9227];
      for (const altPort of alternativePorts) {
        log(`Trying alternative port ${altPort}...`);
        this.port = altPort;
        
        try {
          await this.startChrome();
          logSuccess(`Chrome started successfully on alternative port ${altPort}`);
          return this.getCDPUrl();
        } catch (altError) {
          logError(`Failed to start Chrome on port ${altPort}: ${altError.message}`);
          continue;
        }
      }
      
      throw new Error(`Failed to start Chrome on any port. Tried ports: 9222, ${alternativePorts.join(', ')}`);
    }
  }

  async isPortInUse() {
    try {
      const response = await fetch(`http://localhost:${this.port}/json/version`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export async function startChrome(options = {}) {
  const manager = new ChromeManager(options);
  const cdpUrl = await manager.ensureChromeRunning();
  return { manager, cdpUrl };
}



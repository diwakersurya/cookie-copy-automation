#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { grabCookie, showConfig } from './index.js';
import { startChrome } from './chrome-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const program = new Command();

program
  .name('cookie-copy')
  .description('CLI tool to extract cookies from Chrome Canary using CDP (auto-starts if needed)')
  .version(packageJson.version);

program
  .command('grab')
  .description('Extract cookie from Chrome Canary (auto-starts if not running)')
  .option('-u, --cdp-url <url>', 'Chrome DevTools Protocol URL', 'http://localhost:9222')
  .option('-s, --start-url <url>', 'Starting URL to navigate to', 'https://admin.example.com/login')
  .option('-c, --cookie-name <name>', 'Name of cookie to extract', 'sosense')
  .option('-e, --expect-url <substring>', 'Expected URL substring to confirm landing', '/dashboard')
  .option('-a, --agency <agency>', 'Agency name for interactions', 'multientity')
  .option('-p, --project <project>', 'Project name')
  .option('--custom-select-open <selector>', 'Custom select dropdown selector')
  .option('--custom-select-option <selector>', 'Custom select option selector')
  .option('--login-ul-selector <selector>', 'Login UL selector')
  .option('--login-anchor-selector <selector>', 'Login anchor selector', '#side-menu > li.active > ul > li:nth-child(3) > a')
  .option('--submit-button <selector>', 'Submit button selector', 'button[type="submit"], button[data-testid="continue"], [data-action="login"]')
  .option('--pick-tab-url <substring>', 'Pick tab with URL containing substring')
  .option('--pick-tab-title <substring>', 'Pick tab with title containing substring')
  .option('--nav-timeout <ms>', 'Navigation timeout in milliseconds', '120000')
  .option('--idle-timeout <ms>', 'Idle timeout in milliseconds', '15000')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-q, --quiet', 'Suppress info messages')
  .option('--no-clipboard', 'Don\'t copy cookie value to clipboard')
  .option('--no-auto-start', 'Don\'t automatically start Chrome if not running')
  .option('--chrome-port <port>', 'Chrome debugging port', '9222')
  .option('--chrome-user-data-dir <path>', 'Chrome user data directory')
  .action(async (options) => {
    let chromeManager = null;
    
    // Setup cleanup handlers
    const cleanup = async () => {
      if (chromeManager) {
        console.log(chalk.yellow('[info] Cleaning up Chrome instance...'));
        await chromeManager.stopChrome();
      }
      process.exit(0);
    };

    // Handle process termination signals
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('SIGQUIT', cleanup);

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error(chalk.red('[fatal error]'), error.message);
      if (chromeManager) {
        console.log(chalk.yellow('[info] Cleaning up Chrome instance...'));
        await chromeManager.stopChrome();
      }
      process.exit(1);
    });

    try {
      let cdpUrl = options.cdpUrl;
      
      // Auto-start Chrome unless explicitly disabled
      if (!options.noAutoStart) {
        console.log(chalk.yellow('[info] Checking for Chrome CDP instance...'));
        
        const chromeOptions = {
          port: parseInt(options.chromePort),
          userDataDir: options.chromeUserDataDir,
          verbose: options.verbose
        };
        
        const result = await startChrome(chromeOptions);
        chromeManager = result.manager;
        cdpUrl = result.cdpUrl;
      }

      const config = {
        endpointURL: cdpUrl,
        startUrl: options.startUrl,
        expectUrlIncludes: options.expectUrl,
        cookieName: options.cookieName,
        pickTabUrlIncludes: options.pickTabUrl || '',
        pickTabTitleIncludes: options.pickTabTitle || '',
        agency: options.agency,
        project: options.project,
        customSelectOpen: options.customSelectOpen,
        customSelectOption: options.customSelectOption,
        loginUlSelector: options.loginUlSelector,
        loginAnchorSelector: options.loginAnchorSelector,
        submitButton: options.submitButton,
        timeouts: {
          nav: parseInt(options.navTimeout),
          idle: parseInt(options.idleTimeout),
        },
        verbose: options.verbose,
        quiet: options.quiet,
        copyToClipboard: options.clipboard
      };

      await grabCookie(config);
      
      // Clean up Chrome if we started it
      if (chromeManager) {
        console.log(chalk.yellow('[info] Cleaning up Chrome instance...'));
        await chromeManager.stopChrome();
      }
    } catch (error) {
      console.error(chalk.red('[error]'), error.message);
      // Clean up Chrome if we started it, even on error
      if (chromeManager) {
        console.log(chalk.yellow('[info] Cleaning up Chrome instance...'));
        await chromeManager.stopChrome();
      }
      process.exit(1);
    }
  });

program
  .command('start-chrome')
  .description('Start Chrome Canary with CDP enabled')
  .option('-p, --port <port>', 'Chrome debugging port', '9222')
  .option('--user-data-dir <path>', 'Chrome user data directory')
  .option('-v, --verbose', 'Enable verbose logging')
  .action(async (options) => {
    let chromeManager = null;
    
    // Setup cleanup handlers
    const cleanup = async () => {
      if (chromeManager) {
        console.log(chalk.yellow('[info] Cleaning up Chrome instance...'));
        await chromeManager.stopChrome();
      }
      process.exit(0);
    };

    // Handle process termination signals
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('SIGQUIT', cleanup);

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error(chalk.red('[fatal error]'), error.message);
      if (chromeManager) {
        console.log(chalk.yellow('[info] Cleaning up Chrome instance...'));
        await chromeManager.stopChrome();
      }
      process.exit(1);
    });

    try {
      const chromeOptions = {
        port: parseInt(options.port),
        userDataDir: options.userDataDir,
        verbose: options.verbose
      };

      const result = await startChrome(chromeOptions);
      chromeManager = result.manager;
      const cdpUrl = result.cdpUrl;
      
      console.log(chalk.green('✓ Chrome Canary started successfully!'));
      console.log(chalk.blue('CDP URL:'), cdpUrl);
      console.log(chalk.gray('You can now use: cookie-copy grab'));
      console.log(chalk.yellow('Press Ctrl+C to stop Chrome Canary'));
      
      // Keep the process running to maintain Chrome
      process.stdin.resume();
    } catch (error) {
      console.error(chalk.red('[error]'), error.message);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    showConfig();
  });

// Parse arguments
program.parse();

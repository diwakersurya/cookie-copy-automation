import 'dotenv/config';
import { chromium } from 'playwright';
import clipboard from 'clipboardy';
import chalk from 'chalk';
import { DEFAULT_CONFIG, getConfigFromEnv, getAgencyFromUrl } from '@cookie-copy/shared/config.js';
import { SELECTORS, safeClick, safeMultiSelect } from '@cookie-copy/shared/selectors.js';
import { createLogger, formatCookieData, findCookieByName } from '@cookie-copy/shared/utils.js';

// Create logger instance
let logger;

function initializeLogger(config) {
  logger = createLogger(chalk.blue('[info]'), {
    verbose: config.verbose,
    quiet: config.quiet
  });
}

function log(...args) {
  if (logger) {
    logger.log(...args);
  }
}

function logVerbose(...args) {
  if (logger) {
    logger.logVerbose(...args);
  }
}

function logError(...args) {
  if (logger) {
    logger.logError(...args);
  }
}

function logSuccess(...args) {
  if (logger) {
    logger.logSuccess(...args);
  }
}

async function ensurePage(browser, config) {
  const ctx = browser.contexts()[0];
  if (!ctx) throw new Error('No default browser context found. Is Chrome running with remote debugging?');

  let page = await ctx.newPage();
  log('Opened a new tab in the existing Chrome session ->', config.startUrl);
  await page.goto(config.startUrl, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });
  return page;
}



async function doInteractions(page, config) {
  await selectAgency(page, config);
  await clickLoginAnchor(page, config);
  // submit/proceed with login
  await page.waitForSelector(config.submitButton, { state: 'visible', timeout: config.timeouts.idle });
  
  await finalLogin(page, config);
}

async function waitUntilLanded(page, config) {
  await page.waitForLoadState('networkidle', { timeout: config.timeouts.nav }).catch(() => {});
  const url = page.url();
  if (config.expectUrlIncludes && !url.includes(config.expectUrlIncludes)) {
    log(`Warning: current URL (${url}) does not include "${config.expectUrlIncludes}". Continuing…`);
  } else {
    log('Landed on:', url);
  }
}

async function selectAgency(page, config) {
  return await safeMultiSelect(page, config.customSelectOpen, [config.customSelectOption]);
}

async function clickLoginAnchor(page, config) {
  await safeClick(page, config.loginUlSelector);
  // Wait for the login anchor to be visible before clicking
  await page.waitForSelector(config.loginAnchorSelector, { state: 'visible', timeout: config.timeouts.idle });
  // Click the login anchor
  log('Clicking login anchor:', config.loginAnchorSelector);
  if (!config.loginAnchorSelector) {
    log('No login anchor selector provided, skipping click.');
    return;
  }
  return await safeClick(page, config.loginAnchorSelector);
}

async function finalLogin(page, config) {
  // This is a placeholder for any final login steps if needed
  // For example, you might want to click a "Login" button here
  await safeClick(page, config.submitButton);
}

export async function grabCookie(customConfig = {}) {
  // Merge environment config with custom config
  const config = { ...getConfigFromEnv(), ...customConfig };
  
  // Initialize logger
  initializeLogger(config);
  
  logVerbose('Configuration:', JSON.stringify(config, null, 2));

  // Attach to the running Chrome instance
  const browser = await chromium.connectOverCDP({ endpointURL: config.endpointURL });
  try {
    const page = await ensurePage(browser, config);

    // Run interactions in the *existing* session (cookies preserved)
    await doInteractions(page, config);

    // Wait until the target page is loaded
    await waitUntilLanded(page, config);

    // Extract the cookie from the shared browser context
    const ctx = page.context();
    const cookies = await ctx.cookies();
    const match = findCookieByName(cookies, config.cookieName);
    if (!match) {
      const names = [...new Set(cookies.map(c => c.name))];
      console.log(`Cookie "${config.cookieName}" not found. Known cookies (first 50): ${names.slice(0,50).join(', ')}`);
      process.exitCode = 2;
    } else {
      const cookieData = formatCookieData(match);
      
      console.log(JSON.stringify(cookieData, null, 2));
      
      if (config.copyToClipboard) {
        await clipboard.write(match.value);
        logSuccess('Cookie value copied to clipboard.');
      }
    }
  } finally {
    // Don't close the real Chrome — just disconnect
    await browser.close();
  }
}

export function showConfig() {
  const config = getConfigFromEnv();
  console.log(chalk.cyan('Current Configuration:'));
  console.log(JSON.stringify(config, null, 2));
}

// Legacy main function for backward compatibility
async function main() {
  await grabCookie();
}

// Only run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    logError(err?.message || err);
    process.exit(1);
  });
}

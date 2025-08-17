import 'dotenv/config';
import { chromium } from 'playwright';
import clipboard from 'clipboardy';
import chalk from 'chalk';

// Default configuration
const DEFAULT_CONFIG = {
  endpointURL: 'http://localhost:9222',
  startUrl: 'https://admin.example.com/login',
  expectUrlIncludes: '/dashboard',
  cookieName: 'sosense',
  pickTabUrlIncludes: '',
  pickTabTitleIncludes: '',
  agency: 'multientity',
  project: undefined,
  customSelectOpen: undefined,
  customSelectOption: undefined,
  loginUlSelector: undefined,
  loginAnchorSelector: '#side-menu > li.active > ul > li:nth-child(3) > a',
  submitButton: 'button[type="submit"], button[data-testid="continue"], [data-action="login"]',
  timeouts: {
    nav: 120_000,
    idle: 15_000,
  },
  verbose: false,
  quiet: false,
  copyToClipboard: true
};

// Merge environment variables with defaults
function getConfigFromEnv() {
  return {
    endpointURL: process.env.CDP_URL || DEFAULT_CONFIG.endpointURL,
    startUrl: process.env.START_URL || DEFAULT_CONFIG.startUrl,
    expectUrlIncludes: process.env.EXPECT_URL_INCLUDES || DEFAULT_CONFIG.expectUrlIncludes,
    cookieName: process.env.COOKIE_NAME || DEFAULT_CONFIG.cookieName,
    pickTabUrlIncludes: process.env.PICK_TAB_URL_INCLUDES || DEFAULT_CONFIG.pickTabUrlIncludes,
    pickTabTitleIncludes: process.env.PICK_TAB_TITLE_INCLUDES || DEFAULT_CONFIG.pickTabTitleIncludes,
    agency: process.env.AGENCY || DEFAULT_CONFIG.agency,
    project: process.env.PROJECT || DEFAULT_CONFIG.project,
    customSelectOpen: process.env.CUSTOM_SELECT_OPEN_SELECTOR || DEFAULT_CONFIG.customSelectOpen,
    customSelectOption: process.env.CUSTOM_SELECT_OPTION_SELECTOR || DEFAULT_CONFIG.customSelectOption,
    loginUlSelector: process.env.LOGIN_UL_SELECTOR || DEFAULT_CONFIG.loginUlSelector,
    loginAnchorSelector: process.env.LOGIN_ANCHOR_SELECTOR || DEFAULT_CONFIG.loginAnchorSelector,
    submitButton: process.env.SUBMIT_BUTTON_SELECTOR || DEFAULT_CONFIG.submitButton,
    timeouts: {
      nav: parseInt(process.env.NAV_TIMEOUT) || DEFAULT_CONFIG.timeouts.nav,
      idle: parseInt(process.env.IDLE_TIMEOUT) || DEFAULT_CONFIG.timeouts.idle,
    },
    verbose: process.env.VERBOSE === 'true' || DEFAULT_CONFIG.verbose,
    quiet: process.env.QUIET === 'true' || DEFAULT_CONFIG.quiet,
    copyToClipboard: process.env.COPY_TO_CLIPBOARD !== 'false' && DEFAULT_CONFIG.copyToClipboard
  };
}

function log(...args) {
  if (!global.CFG?.quiet) {
    console.error(chalk.blue('[info]'), ...args);
  }
}

function logVerbose(...args) {
  if (global.CFG?.verbose) {
    console.error(chalk.gray('[debug]'), ...args);
  }
}

function logError(...args) {
  console.error(chalk.red('[error]'), ...args);
}

function logSuccess(...args) {
  console.log(chalk.green('[success]'), ...args);
}

async function ensurePage(browser, config) {
  const ctx = browser.contexts()[0];
  if (!ctx) throw new Error('No default browser context found. Is Chrome running with remote debugging?');

  let page = await ctx.newPage();
  log('Opened a new tab in the existing Chrome session ->', config.startUrl);
  await page.goto(config.startUrl, { waitUntil: 'domcontentloaded', timeout: config.timeouts.nav });
  return page;
}

async function safeMultiSelect(page, dropdownSelector, optionSelectors = []) {
  if (!dropdownSelector || !Array.isArray(optionSelectors) || optionSelectors.length === 0) return;
  const dropdown = await page.$(dropdownSelector);
  if (!dropdown) { log('skip multi-select (dropdown not found):', dropdownSelector); return; }
  await dropdown.click();
  log('opened dropdown', dropdownSelector);

  for (const optSelector of optionSelectors) {
    const option = await page.$(optSelector);
    if (option) {
      await option.click();
      log('selected option', optSelector);
    } else {
      log('option not found:', optSelector);
    }
    // Optionally wait between selections if needed
    await page.waitForTimeout(100);
  }
}

async function safeClick(page, selector) {
  if (!selector) return;
  const el = await page.$(selector);
  if (!el) { log('skip click (not found):', selector); return; }
   await el.click({ force: true });
  log('clicked', selector);
}

async function doInteractions(page, config) {
  await selectAgency(page, config);
  await clickLoginAnchor(page, config);
  // submit/proceed with login
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
  const envConfig = getConfigFromEnv();
  const config = { ...DEFAULT_CONFIG, ...envConfig, ...customConfig };
  
  // Set global config for logging functions
  global.CFG = config;
  
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
    const match = cookies.find(c => c.name === config.cookieName);
    if (!match) {
      const names = [...new Set(cookies.map(c => c.name))];
      console.log(`Cookie "${config.cookieName}" not found. Known cookies (first 50): ${names.slice(0,50).join(', ')}`);
      process.exitCode = 2;
    } else {
      const cookieData = {
        name: match.name,
        value: match.value,
        domain: match.domain,
        path: match.path,
        expires: match.expires,
        httpOnly: match.httpOnly,
        secure: match.secure,
        sameSite: match.sameSite
      };
      
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

import 'dotenv/config';
import { chromium } from 'playwright';
import clipboard from 'clipboardy'; // <-- Add this import

const CFG = {
  endpointURL: process.env.CDP_URL || 'http://localhost:9222',
  startUrl: process.env.START_URL || 'https://admin.example.com/login',
  expectUrlIncludes: process.env.EXPECT_URL_INCLUDES || '/dashboard',
  cookieName: process.env.COOKIE_NAME || 'sosense',

  // How to choose an existing tab to drive (optional heuristics)
  pickTabUrlIncludes: process.env.PICK_TAB_URL_INCLUDES || '',
  pickTabTitleIncludes: process.env.PICK_TAB_TITLE_INCLUDES || '',

  // Interactions
  agency: process.env.AGENCY || 'multientity',
  project: process.env.PROJECT,
  customSelectOpen: process.env.CUSTOM_SELECT_OPEN_SELECTOR,
  customSelectOption: process.env.CUSTOM_SELECT_OPTION_SELECTOR,
  loginUlSelector: process.env.LOGIN_UL_SELECTOR ,
  loginAnchorSelector: process.env.LOGIN_ANCHOR_SELECTOR || '#side-menu > li.active > ul > li:nth-child(3) > a',
  submitButton: process.env.SUBMIT_BUTTON_SELECTOR || 'button[type="submit"], button[data-testid="continue"], [data-action="login"]',

  timeouts: {
    nav: 120_000,
    idle: 15_000,
  },
};

function log(...args) {
  console.error('[info]', ...args);
}



async function ensurePage(browser) {

  const ctx = browser.contexts()[0];
  if (!ctx) throw new Error('No default browser context found. Is Chrome running with remote debugging?');

  let page = await ctx.newPage();
  log('Opened a new tab in the existing Chrome session ->', CFG.startUrl);
  await page.goto(CFG.startUrl, { waitUntil: 'domcontentloaded', timeout: CFG.timeouts.nav });
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

async function doInteractions(page) {

  await selectAgency(page, CFG);
  await clickLoginAnchor(page, CFG);
  // submit/proceed with login
  await finalLogin(page, CFG);
 
}

async function waitUntilLanded(page) {
  await page.waitForLoadState('networkidle', { timeout: CFG.timeouts.nav }).catch(() => {});
  const url = page.url();
  if (CFG.expectUrlIncludes && !url.includes(CFG.expectUrlIncludes)) {
    log(`Warning: current URL (${url}) does not include "${CFG.expectUrlIncludes}". Continuing…`);
  } else {
    log('Landed on:', url);
  }
}

async function selectAgency(page, CFG) {
  return await safeMultiSelect(page, CFG.customSelectOpen, [CFG.customSelectOption]);
}
async function clickLoginAnchor(page, CFG) {
  await safeClick(page, CFG.loginUlSelector);
  // Wait for the login anchor to be visible before clicking
  await page.waitForSelector(CFG.loginAnchorSelector, { state: 'visible', timeout: CFG.timeouts.idle });
  // Click the login anchor
  log('Clicking login anchor:', CFG.loginAnchorSelector);
  if (!CFG.loginAnchorSelector) {
    log('No login anchor selector provided, skipping click.');
    return;
  }
  return await safeClick(page, CFG.loginAnchorSelector);
}
async function finalLogin(page, CFG) {
  // This is a placeholder for any final login steps if needed
  // For example, you might want to click a "Login" button here
  await safeClick(page, CFG.submitButton);
}


async function main() {
  // Attach to the running Chrome instance
  const browser = await chromium.connectOverCDP({ endpointURL: CFG.endpointURL });
  try {
    const page = await ensurePage(browser);

    // Run interactions in the *existing* session (cookies preserved)
    await doInteractions(page);

    // Wait until the target page is loaded
    await waitUntilLanded(page);

    // Extract the cookie from the shared browser context
    const ctx = page.context();
    const cookies = await ctx.cookies();
    const match = cookies.find(c => c.name === CFG.cookieName);
    if (!match) {
      const names = [...new Set(cookies.map(c => c.name))];
      console.log(`Cookie "${CFG.cookieName}" not found. Known cookies (first 50): ${names.slice(0,50).join(', ')}`);
      process.exitCode = 2;
    } else {
      console.log(JSON.stringify({
        name: match.name,
        value: match.value,
        domain: match.domain,
        path: match.path,
        expires: match.expires,
        httpOnly: match.httpOnly,
        secure: match.secure,
        sameSite: match.sameSite
      }, null, 2));
      await clipboard.write(match.value); // <-- Copy cookie value to clipboard
      console.log(`[info] Cookie value copied to clipboard.`);
    }
  } finally {
    // Don't close the real Chrome — just disconnect
    await browser.close();
  }
}

main().catch(err => {
  console.error('[error]', err?.message || err);
  process.exit(1);
});

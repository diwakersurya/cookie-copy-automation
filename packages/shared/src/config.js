// Default configuration shared between CLI and extension
export const DEFAULT_CONFIG = {
  endpointURL: 'http://localhost:9222',
  startUrl: 'https://admin-me.sensehq.com/admin/login',
  expectUrlIncludes: '/dashboard',
  cookieName: 'sosense',
  agency: 'multientity',
  customSelectOpen: '#wrapper > nav > div.top-nav-content > ul:nth-child(3) > div > div > button > span.filter-option.pull-left',
  customSelectOption: '#wrapper > nav > div.top-nav-content > ul:nth-child(3) > div > div > div > ul > li:nth-child(712)',
  loginUlSelector: '#side-menu > li:nth-child(20) > a',
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

// Merge environment variables with defaults (for CLI use)
export function getConfigFromEnv() {
  return {
    endpointURL: process.env.CDP_URL || DEFAULT_CONFIG.endpointURL,
    startUrl: process.env.START_URL || DEFAULT_CONFIG.startUrl,
    expectUrlIncludes: process.env.EXPECT_URL_INCLUDES || DEFAULT_CONFIG.expectUrlIncludes,
    cookieName: process.env.COOKIE_NAME || DEFAULT_CONFIG.cookieName,
    agency: process.env.AGENCY || DEFAULT_CONFIG.agency,
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

// Get agency from URL (shared utility)
export function getAgencyFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const [sub] = u.hostname.split('.');
    return sub || '';
  } catch {
    return '';
  }
}

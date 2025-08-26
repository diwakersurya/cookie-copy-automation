// Shared utility functions for cookie-copy packages

// Logging utilities
export function createLogger(prefix = '[cookie-copy]', options = {}) {
  const { verbose = false, quiet = false } = options;
  
  return {
    log: (...args) => {
      if (!quiet) {
        console.error(prefix, ...args);
      }
    },
    logVerbose: (...args) => {
      if (verbose) {
        console.error(`${prefix} [debug]`, ...args);
      }
    },
    logError: (...args) => {
      console.error(`${prefix} [error]`, ...args);
    },
    logSuccess: (...args) => {
      console.log(`${prefix} [success]`, ...args);
    }
  };
}

// Cookie utilities
export function formatCookieData(cookie) {
  return {
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expires,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite
  };
}

export function findCookieByName(cookies, cookieName) {
  return cookies.find(c => c.name === cookieName);
}

// URL utilities
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// Time utilities
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function waitForElement(page, selector, timeout = 15000) {
  return page.waitForSelector(selector, { 
    state: 'visible', 
    timeout 
  }).catch(() => null);
}

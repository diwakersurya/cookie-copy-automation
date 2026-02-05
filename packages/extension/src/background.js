const DEFAULTS = {
  autoRun: true,
  cookieName: 'sosense',
  expectUrlIncludes: '/dashboard',
  timeouts: { nav: 120000, idle: 15000 },
  selectors: {
    customSelectOpen: '#wrapper > nav > div.top-nav-content > ul:nth-child(3) > div > div > button > span.filter-option.pull-left',
    customSelectOption: '#wrapper > nav > div.top-nav-content > ul:nth-child(3) > div > div > div > ul > li:nth-child(712)',
    loginUlSelector: '#side-menu > li:nth-child(20) > a',
    loginAnchorSelector: '#side-menu > li.active > ul > li:nth-child(3) > a',
    submitButton: 'button[type="submit"], button[data-testid="continue"], [data-action="login"]'
  },
  extraOrigins: []
};

const AGENCY_URL = 'https://multientity.dserver.com/';
const AGENCY_HOST = 'multientity.dserver.com';
const AGENCY_COOKIE_NAME = 'sosense';
const MULTIENTITY_SENSE_HOST = 'multientity.sensehq.com';

function debugNotify(title, message) {
  try {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title,
      message: String(message || '').slice(0, 250),
      priority: 0
    });
  } catch {
    // ignore notification failures
  }
}

function cookiesSet(details) {
  return new Promise((resolve, reject) => {
    chrome.cookies.set(details, (cookie) => {
      const err = chrome.runtime.lastError;
      if (err) return reject(new Error(err.message));
      resolve(cookie);
    });
  });
}

function tabsCreate(createProperties) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create(createProperties, (tab) => {
      const err = chrome.runtime.lastError;
      if (err) return reject(new Error(err.message));
      resolve(tab);
    });
  });
}

async function getSettings() {
  const data = await chrome.storage.sync.get({ settings: DEFAULTS });
  return { ...DEFAULTS, ...(data.settings || {}) };
}

function getAgencyFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const [sub] = u.hostname.split('.');
    return sub || '';
  } catch {
    return '';
  }
}

async function ensureOriginPermission(url) {
  const origin = new URL(url).origin + '/*';
  const granted = await chrome.permissions.contains({ origins: [origin] });
  if (granted) return true;
  return chrome.permissions.request({ origins: [origin] });
}

async function pushCookieToAgency(cookieValue) {
  if (!cookieValue) return { ok: false, reason: 'empty' };

  // De-dupe to avoid opening lots of tabs on repeated onUpdated events.
  const { lastAgencyPush } = await chrome.storage.local.get({ lastAgencyPush: null });
  if (
    lastAgencyPush?.value === cookieValue &&
    typeof lastAgencyPush?.at === 'number' &&
    Date.now() - lastAgencyPush.at < 5 * 60 * 1000
  ) {
    debugNotify('Agency push skipped', `Already pushed recently to ${AGENCY_HOST}.`);
    return { ok: true, skipped: true };
  }

  // Set the cookie on agency.dserver.com before opening the tab,
  // so the first page load has it available.
  await cookiesSet({
    url: AGENCY_URL,
    name: AGENCY_COOKIE_NAME,
    value: cookieValue,
    path: '/',
    secure: true
  });

  await chrome.storage.local.set({
    lastAgencyPush: { value: cookieValue, at: Date.now() }
  });

  const tab = await tabsCreate({ url: AGENCY_URL, active: true });
  debugNotify('Agency tab opened', `Opened ${AGENCY_URL}\nTab ID: ${tab?.id ?? 'unknown'}`);
  return { ok: true, skipped: false };
}

async function runFlow(tabId, url) {
  const settings = await getSettings();
  if (!settings.autoRun) return;

  const urlObj = new URL(url);

  // Important: avoid looping on our own agency tab.
  // agency.dserver.com is inside *.dserver.com so it would otherwise re-trigger runFlow.
  if (urlObj.hostname === AGENCY_HOST) return;

  const host = urlObj.hostname;
  const isDefault =
    host.endsWith('.sensehq.com') ||
    host.endsWith('.dserver.com');
  if (!isDefault) {
    const ok = await ensureOriginPermission(url);
    if (!ok) return;
  }

  const injectedResult = await new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: 'cookie-copy-run-flow', settings }, (res) => {
      const err = chrome.runtime.lastError;
      if (err) return resolve(null);
      resolve(res || null);
    });
  });

  if (injectedResult?.didSelectAgency) return;

  await new Promise(r => setTimeout(r, 1000));
  const cookie = await chrome.cookies.get({ url, name: settings.cookieName });

  const agency = getAgencyFromUrl(url);
  const payload = {
    agency,
    url,
    cookieName: settings.cookieName,
    cookie
  };

  const { recent = {} } = await chrome.storage.local.get({ recent: {} });
  if (cookie?.value) {
    recent[agency] = { value: cookie.value, at: Date.now() };
    await chrome.storage.local.set({ recent });
  }

  if (!cookie) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Cookie not found',
      message: `Cookie "${payload.cookieName}" not found.\nURL: ${agency}`
    });
  } else {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: `Cookie for ${agency}`,
      message: `Name: ${payload.cookieName}\nTap the extension to copy.`,
      priority: 1
    });

    // Auto-copy via offscreen document
    try {
      const offscreens = await chrome.offscreen.hasDocument?.();
      if (!offscreens) {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['CLIPBOARD'],
          justification: 'Copy cookie value to clipboard automatically after retrieval.'
        });
      }
      await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'offscreen-copy', text: cookie.value }, (res) => {
          const err = chrome.runtime.lastError;
          if (err) return resolve({ ok: false, error: err.message });
          resolve(res);
        });
      });

      // Only push to the agency domain once multientity.sensehq.com is open.
      // (We don't require clipboard copy success for this.)
      if (host === MULTIENTITY_SENSE_HOST) {
        debugNotify(
          'Agency push: starting',
          `Host matched (${MULTIENTITY_SENSE_HOST}).\nSetting "${AGENCY_COOKIE_NAME}" on ${AGENCY_HOST} and opening tab.`
        );
        try {
          await pushCookieToAgency(cookie.value);
        } catch (e) {
          debugNotify('Agency push failed', e?.message || String(e));
        }
      }
    } catch (e) {
      // ignore clipboard errors
    }
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;
  const host = new URL(tab.url).hostname;
  const isMatch =
    host.endsWith('.sensehq.com') ||
    host.endsWith('.dserver.com');
  if (isMatch) runFlow(tabId, tab.url);
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type === 'get-current-cookie') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) return sendResponse({ error: 'No active tab' });
      const settings = await getSettings();
      const cookie = await chrome.cookies.get({ url: tab.url, name: settings.cookieName });
      sendResponse({ cookie, cookieName: settings.cookieName, agency: getAgencyFromUrl(tab.url) });
    }
  })();
  return true;
});



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

async function runFlow(tabId, url) {
  const settings = await getSettings();
  if (!settings.autoRun) return;

  const host = new URL(url).hostname;
  const isDefault =
    host.endsWith('.sensehq.com') ||
    host.endsWith('.dserver.com');
  if (!isDefault) {
    const ok = await ensureOriginPermission(url);
    if (!ok) return;
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: async (settings) => {
      const sel = settings.selectors;
      const idle = settings.timeouts.idle;

      const q = (s) => (s ? document.querySelector(s) : null);
      const click = (s) => {
        const el = q(s);
        if (!el) return false;
        el.click();
        return true;
      };
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));

      if (sel.customSelectOpen) {
        click(sel.customSelectOpen);
        await sleep(100);
        if (sel.customSelectOption) click(sel.customSelectOption);
        await sleep(100);
      }

      if (sel.loginUlSelector) click(sel.loginUlSelector);
      await sleep(150);
      if (sel.loginAnchorSelector) click(sel.loginAnchorSelector);

      if (sel.submitButton) {
        const start = Date.now();
        while (Date.now() - start < idle) {
          const btn = q(sel.submitButton);
          if (btn) { btn.click(); break; }
          await sleep(150);
        }
      }

      await sleep(1500);
      return { ok: true, url: location.href };
    },
    args: [settings]
  });

  await new Promise(r => setTimeout(r, 1000));
  const cookie = await chrome.cookies.get({ url, name: (await getSettings()).cookieName });

  const agency = getAgencyFromUrl(url);
  const payload = {
    agency,
    url,
    cookieName: (await getSettings()).cookieName,
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
          resolve(res);
        });
      });
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



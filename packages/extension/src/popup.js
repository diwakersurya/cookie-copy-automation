async function getCurrentCookie() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'get-current-cookie' }, resolve);
  });
}

const DEFAULTS = {
  autoRun: true
};

async function getSettings() {
  const { settings = {} } = await chrome.storage.sync.get({ settings: {} });
  return { ...DEFAULTS, ...(settings || {}) };
}

async function patchSettings(patch) {
  const { settings = {} } = await chrome.storage.sync.get({ settings: {} });
  await chrome.storage.sync.set({
    settings: { ...DEFAULTS, ...(settings || {}), ...(patch || {}) }
  });
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

(async () => {
  const agencyEl = document.getElementById('agency');
  const cnameEl = document.getElementById('cname');
  const cvalEl = document.getElementById('cval');
  const copyBtn = document.getElementById('copy');

  const autoRunEl = document.getElementById('autoRun');
  const openOptionsBtn = document.getElementById('openOptions');
  const settingsStatusEl = document.getElementById('settingsStatus');

  // Settings (works even if the current tab isn't a Sense page)
  try {
    if (autoRunEl) {
      const settings = await getSettings();
      autoRunEl.checked = !!settings.autoRun;
      autoRunEl.addEventListener('change', async () => {
        await patchSettings({ autoRun: autoRunEl.checked });
        if (settingsStatusEl) {
          settingsStatusEl.textContent = 'Saved';
          setTimeout(() => (settingsStatusEl.textContent = ''), 900);
        }
      });
    }

    if (openOptionsBtn) {
      openOptionsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });
    }
  } catch {
    // ignore settings errors in popup
  }

  // Cookie view + copy
  const res = await getCurrentCookie();
  if (res?.error) {
    agencyEl.textContent = '-';
    cnameEl.textContent = res.error;
    cvalEl.textContent = '-';
    copyBtn.disabled = true;
    return;
  }

  agencyEl.textContent = res.agency || '-';
  cnameEl.textContent = res.cookieName || '-';
  cvalEl.textContent = res.cookie?.value || '(not found)';

  copyBtn.disabled = !res?.cookie?.value;
  copyBtn.addEventListener('click', async () => {
    if (!res?.cookie?.value) return;
    const ok = await copy(res.cookie.value);
    copyBtn.textContent = ok ? 'Copied!' : 'Copy failed';
    setTimeout(() => (copyBtn.textContent = 'Copy value'), 1200);
  });
})();



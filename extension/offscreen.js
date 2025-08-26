async function ensureClipboardPermission() {
  try {
    const result = await navigator.permissions.query({ name: 'clipboard-write' });
    return result.state === 'granted' || result.state === 'prompt';
  } catch {
    return true;
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg?.type === 'offscreen-copy' && typeof msg.text === 'string') {
      await ensureClipboardPermission();
      const ok = await copyToClipboard(msg.text);
      sendResponse({ ok });
    }
  })();
  return true;
});



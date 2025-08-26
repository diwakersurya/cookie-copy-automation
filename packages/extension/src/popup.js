async function getCurrentCookie() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'get-current-cookie' }, resolve);
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
  const res = await getCurrentCookie();
  const agencyEl = document.getElementById('agency');
  const cnameEl = document.getElementById('cname');
  const cvalEl = document.getElementById('cval');
  const btn = document.getElementById('copy');

  if (res?.error) {
    cnameEl.textContent = res.error;
    return;
  }

  agencyEl.textContent = res.agency || '-';
  cnameEl.textContent = res.cookieName || '-';
  cvalEl.textContent = res.cookie?.value || '(not found)';

  btn.addEventListener('click', async () => {
    if (!res?.cookie?.value) return;
    const ok = await copy(res.cookie.value);
    btn.textContent = ok ? 'Copied!' : 'Copy failed';
    setTimeout(() => (btn.textContent = 'Copy value'), 1200);
  });
})();



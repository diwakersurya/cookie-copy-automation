import { queryByRole, queryAllByRole, queryByText, queryByLabelText } from '@testing-library/dom';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isPlaceholderLabel(label) {
  const t = (label || '').trim();
  if (!t) return true;
  // Common placeholders for bootstrap-select / similar controls
  if (/^(select|choose)\b/i.test(t)) return true;
  if (/^all\b/i.test(t)) return true;
  return false;
}

function clickEl(el) {
  if (!el) return false;
  try {
    el.scrollIntoView?.({ block: 'center', inline: 'center' });
  } catch {
    // ignore scroll errors
  }
  try {
    el.click();
    return true;
  } catch {
    return false;
  }
}

function clickSelector(selector) {
  if (!selector) return false;
  return clickEl(document.querySelector(selector));
}

function clickByRole(role, name) {
  const el = queryByRole(document.body, role, { name });
  return clickEl(el);
}

function clickByText(name) {
  const el = queryByText(document.body, name);
  return clickEl(el);
}

function clickByLabelText(name) {
  const el = queryByLabelText(document.body, name);
  // Label queries usually return an input/select; click() is still useful for checkboxes etc.
  return clickEl(el);
}

function bestSubmitCandidate() {
  // Prefer explicit submit controls
  const submitInput = document.querySelector('input[type="submit"], button[type="submit"]');
  if (submitInput) return submitInput;

  // Prefer accessible "continue/login" style buttons
  const byName = queryByRole(document.body, 'button', {
    name: /^(continue|sign in|log in|login|submit)$/i
  });
  if (byName) return byName;

  // Fall back to any button that looks like a primary action
  const buttons = queryAllByRole(document.body, 'button');
  return (
    buttons.find((b) => /continue|sign in|log in|login|submit/i.test((b.textContent || '').trim())) ||
    null
  );
}

async function runFlow(settings) {
  const sel = settings?.selectors || {};
  const idle = settings?.timeouts?.idle ?? 15000;

  // Phase 1: only select an agency if none is selected yet.
  // Selecting an agency reloads the page; if we trigger it, stop here and let the next load continue.
  if (sel.customSelectOpen) {
    const labelEl = document.querySelector(sel.customSelectOpen);
    const currentLabel = (labelEl?.textContent || '').trim();
    const hasAgencySelected = !isPlaceholderLabel(currentLabel);

    if (!hasAgencySelected) {
      clickSelector(sel.customSelectOpen);
      await sleep(100);
      if (sel.customSelectOption) clickSelector(sel.customSelectOption);
      await sleep(100);
      return { ok: true, didSelectAgency: true, currentLabel };
    }
  }

  // Navigation/menu clicks.
  // Prefer semantic queries; fall back to configured CSS selectors when needed.
  if (sel.loginUlSelector) clickSelector(sel.loginUlSelector);
  if (!sel.loginUlSelector) {
    clickByRole('link', /login/i) || clickByText(/login/i);
  }

  await sleep(150);

  if (sel.loginAnchorSelector) clickSelector(sel.loginAnchorSelector);
  if (!sel.loginAnchorSelector) {
    clickByRole('link', /login/i) || clickByText(/login/i);
  }

  // Submit action.
  const start = Date.now();
  while (Date.now() - start < idle) {
    if (sel.submitButton && clickSelector(sel.submitButton)) break;

    const submit = bestSubmitCandidate();
    if (submit && clickEl(submit)) break;

    // If there's a labeled form control that can reveal the submit (rare but handy)
    clickByLabelText(/email|username|password/i);

    await sleep(150);
  }

  await sleep(1500);
  return { ok: true, url: location.href, didSelectAgency: false };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg?.type === 'cookie-copy-run-flow') {
      const res = await runFlow(msg.settings);
      sendResponse(res);
    }
  })();
  return true;
});


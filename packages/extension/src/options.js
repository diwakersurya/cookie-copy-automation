const DEFAULTS = {
  autoRun: true,
  cookieName: 'sosense',
  expectUrlIncludes: '/dashboard',
  timeouts: { nav: 120000, idle: 15000 },
  selectors: {
    customSelectOpen: '',
    customSelectOption: '',
    loginUlSelector: '',
    loginAnchorSelector: '',
    submitButton: ''
  },
  extraOrigins: []
};

async function load() {
  const { settings = DEFAULTS } = await chrome.storage.sync.get({ settings: DEFAULTS });
  document.getElementById('autoRun').checked = !!settings.autoRun;
  document.getElementById('cookieName').value = settings.cookieName || 'sosense';
  document.getElementById('idle').value = settings.timeouts?.idle ?? 15000;
  document.getElementById('expect').value = settings.expectUrlIncludes || '';

  document.getElementById('customSelectOpen').value = settings.selectors.customSelectOpen || '';
  document.getElementById('customSelectOption').value = settings.selectors.customSelectOption || '';
  document.getElementById('loginUlSelector').value = settings.selectors.loginUlSelector || '';
  document.getElementById('loginAnchorSelector').value = settings.selectors.loginAnchorSelector || '';
  document.getElementById('submitButton').value = settings.selectors.submitButton || '';

  document.getElementById('extraOrigins').value = (settings.extraOrigins || []).join(', ');
}

async function save() {
  const settings = {
    autoRun: document.getElementById('autoRun').checked,
    cookieName: document.getElementById('cookieName').value || 'sosense',
    expectUrlIncludes: document.getElementById('expect').value || '',
    timeouts: {
      nav: 120000,
      idle: parseInt(document.getElementById('idle').value || '15000', 10)
    },
    selectors: {
      customSelectOpen: document.getElementById('customSelectOpen').value.trim(),
      customSelectOption: document.getElementById('customSelectOption').value.trim(),
      loginUlSelector: document.getElementById('loginUlSelector').value.trim(),
      loginAnchorSelector: document.getElementById('loginAnchorSelector').value.trim(),
      submitButton: document.getElementById('submitButton').value.trim()
    },
    extraOrigins: document.getElementById('extraOrigins').value
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  };

  await chrome.storage.sync.set({ settings });
  const status = document.getElementById('status');
  status.textContent = 'Saved';
  setTimeout(() => (status.textContent = ''), 1200);
}

document.getElementById('save').addEventListener('click', save);
load();



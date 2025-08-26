// Shared selectors for cookie-copy packages
export const SELECTORS = {
  customSelectOpen: '#wrapper > nav > div.top-nav-content > ul:nth-child(3) > div > div > button > span.filter-option.pull-left',
  customSelectOption: '#wrapper > nav > div.top-nav-content > ul:nth-child(3) > div > div > div > ul > li:nth-child(712)',
  loginUlSelector: '#side-menu > li:nth-child(20) > a',
  loginAnchorSelector: '#side-menu > li.active > ul > li:nth-child(3) > a',
  submitButton: 'button[type="submit"], button[data-testid="continue"], [data-action="login"]'
};

// Helper functions for selector operations
export function safeClick(page, selector) {
  if (!selector) return Promise.resolve(false);
  return page.$(selector).then(el => {
    if (!el) return false;
    return el.click({ force: true }).then(() => true);
  });
}

export function safeMultiSelect(page, dropdownSelector, optionSelectors = []) {
  if (!dropdownSelector || !Array.isArray(optionSelectors) || optionSelectors.length === 0) {
    return Promise.resolve();
  }
  
  return page.$(dropdownSelector).then(dropdown => {
    if (!dropdown) return Promise.resolve();
    
    return dropdown.click().then(() => {
      const promises = optionSelectors.map(optSelector => 
        page.$(optSelector).then(option => {
          if (option) {
            return option.click();
          }
          return Promise.resolve();
        })
      );
      return Promise.all(promises);
    });
  });
}

# Cookie Copy Shared

Shared utilities, configuration, and selectors for the cookie-copy monorepo.

## Features

- ⚙️ **Configuration Management**: Default configs and environment variable handling
- 🎯 **Selector Management**: Shared CSS selectors for web interactions
- 🛠️ **Utility Functions**: Common utilities for logging, cookie handling, and more
- 🔄 **Code Reuse**: Shared between CLI and extension packages

## Usage

```javascript
// Import configuration
import { DEFAULT_CONFIG, getConfigFromEnv } from '@cookie-copy/shared/config.js';

// Import selectors
import { SELECTORS, safeClick, safeMultiSelect } from '@cookie-copy/shared/selectors.js';

// Import utilities
import { createLogger, formatCookieData, findCookieByName } from '@cookie-copy/shared/utils.js';
```

## Exports

### Configuration (`./config`)
- `DEFAULT_CONFIG` - Default configuration object
- `getConfigFromEnv()` - Get config from environment variables
- `getAgencyFromUrl(url)` - Extract agency from URL

### Selectors (`./selectors`)
- `SELECTORS` - Object containing all CSS selectors
- `safeClick(page, selector)` - Safely click an element
- `safeMultiSelect(page, dropdownSelector, optionSelectors)` - Handle multi-select dropdowns

### Utilities (`./utils`)
- `createLogger(prefix, options)` - Create a logger instance
- `formatCookieData(cookie)` - Format cookie object for output
- `findCookieByName(cookies, cookieName)` - Find cookie by name
- `isValidUrl(string)` - Validate URL string
- `getDomainFromUrl(url)` - Extract domain from URL
- `sleep(ms)` - Promise-based sleep function
- `waitForElement(page, selector, timeout)` - Wait for element to appear

## Dependencies

This package has no external dependencies.

## License

MIT License

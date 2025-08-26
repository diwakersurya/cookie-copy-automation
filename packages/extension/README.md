# Cookie Copy Extension

A Chrome extension for automated cookie grabbing and interaction automation.

## Features

- 🍪 **Cookie Extraction**: Automatically extracts cookies from web pages
- 🤖 **Interaction Automation**: Performs automated interactions on web pages
- ⚙️ **Configurable**: Customizable selectors and settings
- 📋 **Clipboard Integration**: Copies cookie values to clipboard
- 🔧 **Easy Installation**: Simple Chrome extension installation

## Installation

This package is part of the cookie-copy monorepo. To build the extension:

```bash
# From the root directory
pnpm install
pnpm ext:build
```

## Development

```bash
# Build extension
pnpm ext:build

# Build and watch for changes
pnpm ext:dev

# Create icons
pnpm ext:create-icons
```

## Loading in Chrome

1. Build the extension: `pnpm ext:build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `packages/extension/dist` directory

## Configuration

The extension can be configured through the options page:
- Cookie name to extract
- Expected URL patterns
- Custom selectors for interactions
- Timeout settings

## Structure

```
packages/extension/
├── src/           # Source JavaScript files
├── public/        # HTML files and manifest
└── dist/          # Built extension (generated)
```

## Dependencies

This package depends on:
- `@cookie-copy/shared` - Shared utilities and configuration

## License

MIT License

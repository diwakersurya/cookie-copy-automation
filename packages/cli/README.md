# Cookie Copy CLI

A command-line tool to extract cookies from an already running Chrome instance using Chrome DevTools Protocol (CDP).

## Features

- 🔗 **CDP Integration**: Connects to running Chrome via Chrome DevTools Protocol
- 🍪 **Cookie Extraction**: Extracts specific cookies from existing sessions
- 🎯 **Session Reuse**: Reuses existing authenticated sessions (no re-login needed)
- 📋 **Clipboard Integration**: Automatically copies cookie values to clipboard
- ⚙️ **Flexible Configuration**: Environment variables + CLI options
- 🎨 **Colored Output**: Beautiful terminal output with chalk
- 📖 **Comprehensive Help**: Built-in help and documentation
- 🚀 **Auto Chrome Management**: Automatically starts Chrome if not running
- 🔧 **Cross-Platform**: Works on macOS, Linux, and Windows

## Installation

This package is part of the cookie-copy monorepo. To install dependencies:

```bash
# From the root directory
pnpm install
```

## Usage

### Basic Usage

```bash
# Extract cookie with automatic Chrome management
pnpm cli:dev grab

# Extract specific cookie
pnpm cli:dev grab --cookie-name sessionId

# Use custom CDP URL
pnpm cli:dev grab --cdp-url http://localhost:9223

# Verbose mode for debugging
pnpm cli:dev grab --verbose
```

### Chrome Management Commands

```bash
# Start Chrome with CDP enabled
pnpm cli:dev start-chrome

# Start Chrome on custom port
pnpm cli:dev start-chrome --port 9223

# Check if Chrome is running with CDP
pnpm cli:dev start-chrome --check-only
```

### Configuration Commands

```bash
# Show current configuration
pnpm cli:dev config

# Show help
pnpm cli:dev --help
```

## Development

```bash
# Run in development mode
pnpm cli:dev

# Run tests
pnpm cli:test
```

## Dependencies

This package depends on:
- `@cookie-copy/shared` - Shared utilities and configuration
- `playwright` - Chrome automation
- `commander` - CLI argument parsing
- `chalk` - Terminal colors
- `clipboardy` - Clipboard operations
- `dotenv` - Environment variable loading

## License

MIT License

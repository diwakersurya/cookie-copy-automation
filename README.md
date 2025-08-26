
# Cookie Copy Monorepo

A monorepo containing both a CLI tool and browser extension for extracting cookies from Chrome using Chrome DevTools Protocol (CDP).

## 📦 Packages

This monorepo contains the following packages:

- **`@cookie-copy/cli`** - Command-line tool for cookie extraction
- **`@cookie-copy/extension`** - Chrome browser extension for automated cookie grabbing
- **`@cookie-copy/shared`** - Shared utilities, configuration, and selectors

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cookie-copy

# Install dependencies
pnpm install
```

### CLI Usage

```bash
# Extract cookies using the CLI
pnpm cli:dev grab

# Start Chrome with CDP enabled
pnpm cli:dev start-chrome

# Show configuration
pnpm cli:dev config
```

### Extension Usage

```bash
# Build the extension
pnpm ext:build

# Build and watch for changes
pnpm ext:dev
```

Then load the extension in Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/extension/dist`

## 📁 Project Structure

```
cookie-copy/
├── 📁 packages/
│   ├── 📁 cli/                    # CLI package
│   │   ├── 📄 package.json
│   │   ├── 📁 src/
│   │   │   ├── 📄 cli.js          # CLI entry point
│   │   │   ├── 📄 index.js        # Core functionality
│   │   │   └── 📄 chrome-manager.js # Chrome process management
│   │   ├── 📄 test-cli.js         # CLI tests
│   │   └── 📄 README.md
│   │
│   ├── 📁 extension/              # Browser extension package
│   │   ├── 📄 package.json
│   │   ├── 📁 src/                # Extension source files
│   │   ├── 📁 public/             # Extension public files
│   │   ├── 📁 dist/               # Built extension (generated)
│   │   └── 📄 README.md
│   │
│   └── 📁 shared/                 # Shared utilities package
│       ├── 📄 package.json
│       ├── 📁 src/
│       │   ├── 📄 config.js       # Shared configuration
│       │   ├── 📄 selectors.js    # Shared selectors
│       │   ├── 📄 utils.js        # Shared utilities
│       │   └── 📄 index.js        # Main exports
│       └── 📄 README.md
│
├── 📁 tools/                      # Build tools and scripts
│   ├── 📄 build-extension.js      # Extension build tool
│   └── 📄 create-icons.js         # Icon generation
│
├── 📄 package.json               # Root workspace configuration
├── 📄 pnpm-workspace.yaml        # pnpm workspace config
└── 📄 README.md                  # This file
```

## 🛠️ Development

### Available Scripts

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode
pnpm dev

# Run tests
pnpm test

# CLI specific commands
pnpm cli:dev grab              # Run CLI grab command
pnpm cli:dev start-chrome      # Start Chrome with CDP
pnpm cli:test                  # Run CLI tests

# Extension specific commands
pnpm ext:build                 # Build extension
pnpm ext:dev                   # Build and watch extension
pnpm ext:create-icons          # Generate extension icons
```

### Package Development

Each package can be developed independently:

```bash
# Work on CLI package
cd packages/cli
pnpm dev

# Work on extension package
cd packages/extension
pnpm dev

# Work on shared package
cd packages/shared
pnpm dev
```

## 🔧 Configuration

### Environment Variables

The CLI tool supports various environment variables for configuration:

```bash
export CDP_URL="http://localhost:9222"
export START_URL="https://admin.example.com/login"
export COOKIE_NAME="sosense"
export EXPECT_URL_INCLUDES="/dashboard"
export AGENCY="multientity"
export VERBOSE="true"
```

### Extension Configuration

The extension can be configured through its options page:
- Cookie name to extract
- Expected URL patterns
- Custom selectors for interactions
- Timeout settings

## 📋 Features

### CLI Features
- 🔗 **CDP Integration**: Connects to running Chrome via Chrome DevTools Protocol
- 🍪 **Cookie Extraction**: Extracts specific cookies from existing sessions
- 🎯 **Session Reuse**: Reuses existing authenticated sessions (no re-login needed)
- 📋 **Clipboard Integration**: Automatically copies cookie values to clipboard
- ⚙️ **Flexible Configuration**: Environment variables + CLI options
- 🎨 **Colored Output**: Beautiful terminal output with chalk
- 🚀 **Auto Chrome Management**: Automatically starts Chrome if not running
- 🔧 **Cross-Platform**: Works on macOS, Linux, and Windows

### Extension Features
- 🍪 **Cookie Extraction**: Automatically extracts cookies from web pages
- 🤖 **Interaction Automation**: Performs automated interactions on web pages
- ⚙️ **Configurable**: Customizable selectors and settings
- 📋 **Clipboard Integration**: Copies cookie values to clipboard
- 🔧 **Easy Installation**: Simple Chrome extension installation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Documentation

- [CLI Documentation](./packages/cli/README.md)
- [Extension Documentation](./packages/extension/README.md)
- [Shared Package Documentation](./packages/shared/README.md)
- [CLI Structure Documentation](./CLI_STRUCTURE.md)
- [Installation Guide](./INSTALLATION.md)

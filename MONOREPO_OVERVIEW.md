# Cookie Copy Monorepo - Complete Project Overview

## 🏗️ Architecture Overview

This project has been successfully converted from a single-package structure to a monorepo containing three distinct packages:

```
cookie-copy/
├── 📦 packages/
│   ├── 🖥️  cli/           # Command-line interface tool
│   ├── 🌐 extension/      # Chrome browser extension
│   └── 🔧 shared/         # Shared utilities and configuration
├── 🛠️  tools/            # Build tools and scripts
└── 📄 Root config files
```

## 📦 Package Details

### 1. `@cookie-copy/cli` - Command Line Interface

**Purpose**: Extract cookies from running Chrome instances using Chrome DevTools Protocol (CDP)

**Key Features**:
- 🔗 CDP Integration with Playwright
- 🍪 Cookie extraction from existing sessions
- 🎯 Session reuse (no re-login required)
- 📋 Automatic clipboard integration
- ⚙️ Flexible configuration via environment variables and CLI options
- 🚀 Auto Chrome management
- 🔧 Cross-platform support

**Structure**:
```
packages/cli/
├── src/
│   ├── cli.js              # CLI entry point with Commander.js
│   ├── index.js            # Core cookie extraction logic
│   └── chrome-manager.js   # Chrome process management
├── test-cli.js             # CLI functionality tests
├── package.json            # Package configuration
└── README.md              # Package documentation
```

**Dependencies**:
- `@cookie-copy/shared` - Shared utilities
- `playwright` - Chrome automation
- `commander` - CLI argument parsing
- `chalk` - Terminal colors
- `clipboardy` - Clipboard operations
- `dotenv` - Environment variables

**Usage**:
```bash
# From root directory
pnpm cli:dev grab                    # Extract cookies
pnpm cli:dev start-chrome           # Start Chrome with CDP
pnpm cli:dev config                 # Show configuration
pnpm cli:test                       # Run tests
```

### 2. `@cookie-copy/extension` - Chrome Browser Extension

**Purpose**: Browser extension for automated cookie grabbing and web interaction

**Key Features**:
- 🍪 Automatic cookie extraction from web pages
- 🤖 Automated web interactions
- ⚙️ Configurable selectors and settings
- 📋 Clipboard integration
- 🔧 Easy Chrome installation

**Structure**:
```
packages/extension/
├── src/                    # Extension source files
│   ├── background.js       # Service worker
│   ├── content.js          # Content script
│   ├── popup.js           # Popup logic
│   ├── options.js         # Options page logic
│   └── offscreen.js       # Offscreen page
├── public/                 # Extension public files
│   ├── manifest.json      # Extension manifest
│   ├── popup.html         # Popup UI
│   ├── options.html       # Options page
│   ├── offscreen.html     # Offscreen page
│   └── icons/             # Extension icons
├── dist/                  # Built extension (generated)
├── package.json           # Package configuration
└── README.md             # Package documentation
```

**Dependencies**:
- `@cookie-copy/shared` - Shared utilities

**Usage**:
```bash
# From root directory
pnpm ext:build              # Build extension
pnpm ext:dev                # Build and watch for changes
pnpm ext:create-icons       # Generate icons
```

### 3. `@cookie-copy/shared` - Shared Utilities

**Purpose**: Common utilities, configuration, and selectors shared between CLI and extension

**Key Features**:
- ⚙️ Configuration management
- 🎯 Selector management
- 🛠️ Utility functions
- 🔄 Code reuse between packages

**Structure**:
```
packages/shared/
├── src/
│   ├── config.js          # Configuration and environment handling
│   ├── selectors.js       # CSS selectors and interaction helpers
│   ├── utils.js           # Common utility functions
│   └── index.js           # Main exports
├── package.json           # Package configuration
└── README.md             # Package documentation
```

**Exports**:
```javascript
// Configuration
import { DEFAULT_CONFIG, getConfigFromEnv } from '@cookie-copy/shared/config.js';

// Selectors
import { SELECTORS, safeClick, safeMultiSelect } from '@cookie-copy/shared/selectors.js';

// Utilities
import { createLogger, formatCookieData, findCookieByName } from '@cookie-copy/shared/utils.js';
```

## 🛠️ Build Tools

### Extension Build Tool (`tools/build-extension.js`)

**Purpose**: Build the Chrome extension from source files

**Features**:
- 📁 File copying from src/ and public/ to dist/
- 🔄 Watch mode for development
- 📋 Progress reporting
- 🧹 Clean builds

**Usage**:
```bash
node tools/build-extension.js        # Build once
node tools/build-extension.js --watch # Build and watch
```

### Icon Generation Tool (`tools/create-icons.js`)

**Purpose**: Generate extension icons in various sizes

## 🔧 Workspace Configuration

### Root Package.json
- **Workspace Management**: Uses pnpm workspaces
- **Scripts**: Orchestrates builds across all packages
- **Dev Dependencies**: Common development tools

### pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
```

## 📋 Available Scripts

### Root Level Scripts
```bash
pnpm install              # Install all dependencies
pnpm build                # Build all packages
pnpm dev                  # Development mode
pnpm test                 # Run all tests
pnpm lint                 # Lint all packages
pnpm clean                # Clean all packages
```

### CLI Package Scripts
```bash
pnpm cli:dev grab         # Run CLI grab command
pnpm cli:dev start-chrome # Start Chrome with CDP
pnpm cli:test            # Run CLI tests
```

### Extension Package Scripts
```bash
pnpm ext:build           # Build extension
pnpm ext:dev             # Build and watch extension
pnpm ext:create-icons    # Generate extension icons
```

## 🔄 Development Workflow

### 1. Initial Setup
```bash
git clone <repository>
cd cookie-copy
pnpm install
```

### 2. CLI Development
```bash
# Test CLI functionality
pnpm cli:dev config
pnpm cli:dev --help

# Run CLI with custom options
pnpm cli:dev grab --verbose --cookie-name sessionId
```

### 3. Extension Development
```bash
# Build extension
pnpm ext:build

# Development mode with file watching
pnpm ext:dev

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select packages/extension/dist
```

### 4. Shared Package Development
```bash
# The shared package is automatically used by other packages
# Changes to shared code will be reflected in CLI and extension
```

## 🔗 Package Dependencies

```
Root
├── @cookie-copy/cli
│   └── @cookie-copy/shared
├── @cookie-copy/extension
│   └── @cookie-copy/shared
└── @cookie-copy/shared
    └── (no dependencies)
```

## 📊 Benefits of Monorepo Structure

### 1. Code Reuse
- **Shared Configuration**: Both CLI and extension use the same default configs
- **Shared Selectors**: CSS selectors are maintained in one place
- **Shared Utilities**: Common functions like logging and cookie handling

### 2. Development Efficiency
- **Single Repository**: All related code in one place
- **Atomic Changes**: Changes to shared code affect all packages
- **Consistent Tooling**: Same linting, formatting, and build tools

### 3. Maintenance
- **Centralized Updates**: Update dependencies once for all packages
- **Version Synchronization**: Keep all packages in sync
- **Simplified CI/CD**: Single pipeline for all packages

### 4. Testing
- **Integration Testing**: Test packages together
- **Shared Test Utilities**: Common testing helpers
- **Cross-Package Validation**: Ensure compatibility

## 🔧 Configuration Management

### Environment Variables (CLI)
```bash
export CDP_URL="http://localhost:9222"
export START_URL="https://admin.example.com/login"
export COOKIE_NAME="sosense"
export EXPECT_URL_INCLUDES="/dashboard"
export AGENCY="multientity"
export VERBOSE="true"
```

### Extension Configuration
- Configured through the extension's options page
- Settings stored in Chrome's sync storage
- Real-time configuration updates

## 🚀 Deployment

### CLI Package
- Can be published to npm as `@cookie-copy/cli`
- Global installation: `npm install -g @cookie-copy/cli`
- Local development: `pnpm cli:dev`

### Extension Package
- Built to `packages/extension/dist/`
- Loaded as unpacked extension in Chrome
- Can be packaged for Chrome Web Store

## 🔍 Troubleshooting

### Common Issues

1. **Package Import Errors**
   - Ensure pnpm workspace is properly configured
   - Check package.json exports in shared package
   - Verify import paths include `.js` extension

2. **Extension Build Issues**
   - Check file paths in build tool
   - Ensure all required files exist in src/ and public/
   - Verify manifest.json is valid

3. **CLI Import Errors**
   - Check shared package exports
   - Verify import statements include `.js` extension
   - Ensure workspace dependencies are installed

### Debug Commands
```bash
# Check workspace status
pnpm list --depth=0

# Check package dependencies
pnpm why @cookie-copy/shared

# Build with verbose output
pnpm ext:build --verbose
```

## 📈 Future Enhancements

### Potential Improvements
1. **TypeScript Migration**: Add type safety across all packages
2. **Testing Framework**: Implement comprehensive testing
3. **CI/CD Pipeline**: Automated testing and deployment
4. **Documentation**: API documentation and examples
5. **Performance Monitoring**: Add metrics and monitoring
6. **Plugin System**: Extensible architecture for custom selectors

### Package Expansion
1. **API Package**: REST API for cookie extraction
2. **Desktop App**: Electron-based desktop application
3. **Mobile App**: React Native mobile application
4. **SDK Package**: JavaScript SDK for integration

## 📄 License

MIT License - see LICENSE file for details.

---

This monorepo structure provides a solid foundation for maintaining and extending the cookie-copy project while ensuring code quality, reusability, and developer productivity.

# Cookie Copy CLI - Installation Guide

## Quick Start

### 1. Install Globally
```bash
npm install -g cookie-copy
```

### 2. Use with Auto Chrome Management (Recommended)
```bash
# The tool will automatically start Chrome if needed
cookie-copy grab --auto-start-chrome

# Or just use the default behavior (auto-starts if CDP not available)
cookie-copy grab
```

### 3. Manual Chrome Setup (Alternative)
```bash
# Start Chrome manually
cookie-copy start-chrome

# Extract cookies
cookie-copy grab
```

## Development Installation

### 1. Clone and Install
```bash
git clone <repository-url>
cd cookie-copy
npm install
```

### 2. Run Tests
```bash
npm test
```

### 3. Use Locally
```bash
# Run directly with auto Chrome management
node src/cli.js grab --auto-start-chrome

# Or use npm scripts
npm run grab
npm run config
npm run start-chrome
```

### 4. Install Globally (Development)
```bash
npm install -g .
```

## Chrome Management

### Automatic Chrome Management
The tool can automatically start Chrome with CDP enabled:

```bash
# Auto-start Chrome and extract cookies
cookie-copy grab --auto-start-chrome

# Check if Chrome is running with CDP
cookie-copy start-chrome --check-only

# Start Chrome manually
cookie-copy start-chrome --verbose
```

### Manual Chrome Setup
If you prefer to start Chrome manually:

```bash
# macOS (Chrome Canary)
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/Library/Application Support/Google/Chrome Canary/Default"

# macOS (Regular Chrome)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222

# Windows (PowerShell)
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222
```

## Configuration

### Environment Variables
Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

### CLI Options
Use `cookie-copy grab --help` to see all available options.

## Usage Examples

### Basic Usage
```bash
# Extract cookie with auto Chrome management
cookie-copy grab --auto-start-chrome

# Extract specific cookie
cookie-copy grab --cookie-name sessionId --auto-start-chrome

# Use custom port
cookie-copy grab --chrome-port 9223 --auto-start-chrome
```

### Advanced Usage
```bash
# Full configuration with auto Chrome management
cookie-copy grab \
  --auto-start-chrome \
  --chrome-port 9222 \
  --start-url https://admin.example.com/login \
  --cookie-name sosense \
  --expect-url /dashboard \
  --verbose
```

### Chrome Management
```bash
# Check Chrome status
cookie-copy start-chrome --check-only

# Start Chrome on custom port
cookie-copy start-chrome --port 9223 --verbose

# Start Chrome with custom profile
cookie-copy start-chrome --user-data-dir "/custom/profile"
```

## Troubleshooting

### Common Issues

1. **"No Chrome executable found"**
   - Install Google Chrome or Chrome Canary
   - The tool will automatically detect the installation

2. **"Chrome started but CDP connection failed"**
   - Check if port 9222 is already in use
   - Try a different port: `--chrome-port 9223`
   - Ensure no firewall is blocking the connection

3. **"No default browser context found"**
   - Chrome is running but without CDP enabled
   - Use `--auto-start-chrome` to start Chrome properly
   - Or manually start Chrome with `--remote-debugging-port=9222`

4. **"Cookie not found"**
   - Verify the cookie name is correct
   - Ensure you're logged into the target site
   - Check that the cookie is scoped to the domain you navigated to

5. **"Navigation timeout"**
   - Increase the `--nav-timeout` value
   - Check your internet connection
   - Verify the start URL is accessible

6. **"Element not found"**
   - Update selectors to match the current page structure
   - Use `--verbose` to see which selectors are being used

7. **Permission denied**
   - Use `sudo npm install -g cookie-copy` (macOS/Linux)
   - Or configure npm to use a different directory

### Debug Mode
```bash
# Verbose logging with auto Chrome management
cookie-copy grab --verbose --auto-start-chrome

# Check Chrome status
cookie-copy start-chrome --check-only --verbose
```

## Platform Support

### macOS
- Chrome Canary (preferred)
- Chrome Stable
- Auto-detection of installation paths

### Linux
- google-chrome-canary
- google-chrome
- Uses `which` command for detection

### Windows
- Chrome SxS (Canary)
- Chrome Stable
- Checks file existence

## Uninstall

```bash
npm uninstall -g cookie-copy
```

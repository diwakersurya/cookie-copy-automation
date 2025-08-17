# Cookie Copy CLI - Installation Guide

## Quick Start

### 1. Install Globally
```bash
npm install -g cookie-copy
```

### 2. Start Chrome with Remote Debugging
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

### 3. Use the CLI
```bash
# Extract cookie with default settings
cookie-copy grab

# Extract specific cookie
cookie-copy grab --cookie-name sessionId

# Verbose mode for debugging
cookie-copy grab --verbose

# Show current configuration
cookie-copy config
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
# Run directly
node src/cli.js grab

# Or use npm scripts
npm run grab
npm run config
```

### 4. Install Globally (Development)
```bash
npm install -g .
```

## Configuration

### Environment Variables
Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

### CLI Options
Use `cookie-copy grab --help` to see all available options.

## Troubleshooting

### Common Issues

1. **"No default browser context found"**
   - Ensure Chrome is running with `--remote-debugging-port=9222`
   - Check that the CDP URL is correct

2. **"Cookie not found"**
   - Verify the cookie name is correct
   - Ensure you're logged into the target site

3. **Permission denied**
   - Use `sudo npm install -g cookie-copy` (macOS/Linux)
   - Or configure npm to use a different directory

### Debug Mode
```bash
cookie-copy grab --verbose
```

## Uninstall

```bash
npm uninstall -g cookie-copy
```

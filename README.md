
# Cookie Copy CLI

A command-line tool to extract cookies from an already running Chrome instance using Chrome DevTools Protocol (CDP). This tool attaches to an existing Chrome session, performs interactions, and extracts specific cookies without launching a new browser or creating a new profile.

## Features

- 🔗 **CDP Integration**: Connects to running Chrome via Chrome DevTools Protocol
- 🍪 **Cookie Extraction**: Extracts specific cookies from existing sessions
- 🎯 **Session Reuse**: Reuses existing authenticated sessions (no re-login needed)
- 📋 **Clipboard Integration**: Automatically copies cookie values to clipboard
- ⚙️ **Flexible Configuration**: Environment variables + CLI options
- 🎨 **Colored Output**: Beautiful terminal output with chalk
- 📖 **Comprehensive Help**: Built-in help and documentation

## Installation

### Local Development
```bash
git clone <repository-url>
cd cookie-copy
npm install
```

### Global Installation
```bash
npm install -g cookie-copy
```

## Prerequisites

### 1. Start Chrome with Remote Debugging

**macOS (Chrome Canary)**
```bash
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/Library/Application Support/Google/Chrome Canary/Default"
```

**macOS (Regular Chrome)**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222
```

**Linux**
```bash
google-chrome --remote-debugging-port=9222
```

**Windows (PowerShell)**
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222
```

> **Important**: Use the same Chrome window you're already logged into. No new profile is created; the tool attaches to your existing session.

## Usage

### Basic Usage

```bash
# Extract cookie with default settings
cookie-copy grab

# Extract specific cookie
cookie-copy grab --cookie-name sessionId

# Use custom CDP URL
cookie-copy grab --cdp-url http://localhost:9223
```

### Advanced Usage

```bash
# Full configuration example
cookie-copy grab \
  --cdp-url http://localhost:9222 \
  --start-url https://admin.example.com/login \
  --cookie-name sosense \
  --expect-url /dashboard \
  --agency multientity \
  --project myproject \
  --verbose
```

### Configuration Commands

```bash
# Show current configuration
cookie-copy config

# Show help
cookie-copy --help

# Show version
cookie-copy --version
```

## CLI Options

### Global Options
- `-v, --version` - Show version number
- `-h, --help` - Show help

### Grab Command Options
- `-u, --cdp-url <url>` - Chrome DevTools Protocol URL (default: http://localhost:9222)
- `-s, --start-url <url>` - Starting URL to navigate to (default: https://admin.example.com/login)
- `-c, --cookie-name <name>` - Name of cookie to extract (default: sosense)
- `-e, --expect-url <substring>` - Expected URL substring to confirm landing (default: /dashboard)
- `-a, --agency <agency>` - Agency name for interactions (default: multientity)
- `-p, --project <project>` - Project name
- `--custom-select-open <selector>` - Custom select dropdown selector
- `--custom-select-option <selector>` - Custom select option selector
- `--login-ul-selector <selector>` - Login UL selector
- `--login-anchor-selector <selector>` - Login anchor selector
- `--submit-button <selector>` - Submit button selector
- `--pick-tab-url <substring>` - Pick tab with URL containing substring
- `--pick-tab-title <substring>` - Pick tab with title containing substring
- `--nav-timeout <ms>` - Navigation timeout in milliseconds (default: 120000)
- `--idle-timeout <ms>` - Idle timeout in milliseconds (default: 15000)
- `-v, --verbose` - Enable verbose logging
- `-q, --quiet` - Suppress info messages
- `--no-clipboard` - Don't copy cookie value to clipboard

## Environment Variables

You can also configure the tool using environment variables:

```bash
export CDP_URL="http://localhost:9222"
export START_URL="https://admin.example.com/login"
export COOKIE_NAME="sosense"
export EXPECT_URL_INCLUDES="/dashboard"
export AGENCY="multientity"
export PROJECT="myproject"
export VERBOSE="true"
export QUIET="false"
export COPY_TO_CLIPBOARD="true"
```

## Output

The tool outputs cookie data in JSON format to stdout:

```json
{
  "name": "sosense",
  "value": "abc123def456...",
  "domain": ".example.com",
  "path": "/",
  "expires": 1735689600,
  "httpOnly": true,
  "secure": true,
  "sameSite": "Lax"
}
```

## Error Handling

- **Exit Code 0**: Success
- **Exit Code 1**: General error (connection, navigation, etc.)
- **Exit Code 2**: Cookie not found

## Examples

### Extract Session Cookie
```bash
cookie-copy grab --cookie-name sessionId --start-url https://app.example.com
```

### Quiet Mode (Scripts)
```bash
cookie-copy grab --quiet --no-clipboard | jq -r '.value'
```

### Verbose Debugging
```bash
cookie-copy grab --verbose --cdp-url http://localhost:9222
```

### Custom Selectors
```bash
cookie-copy grab \
  --custom-select-open "#agency-select" \
  --custom-select-option "#agency-option-1" \
  --login-anchor-selector "#login-link"
```

## Troubleshooting

### Common Issues

1. **"No default browser context found"**
   - Ensure Chrome is running with `--remote-debugging-port=9222`
   - Check that the CDP URL is correct

2. **"Cookie not found"**
   - Verify the cookie name is correct
   - Ensure you're logged into the target site
   - Check that the cookie is scoped to the domain you navigated to

3. **"Navigation timeout"**
   - Increase the `--nav-timeout` value
   - Check your internet connection
   - Verify the start URL is accessible

4. **"Element not found"**
   - Update selectors to match the current page structure
   - Use `--verbose` to see which selectors are being used

### Debug Mode

Use verbose logging to debug issues:

```bash
cookie-copy grab --verbose
```

This will show:
- Configuration being used
- Navigation steps
- Element interactions
- Cookie extraction details

## Development

### Local Development Setup
```bash
npm install
npm run start
```

### Running Tests
```bash
npm test
```

### Building for Distribution
```bash
npm run build
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security Notes

- This tool does **not** bypass MFA or 2FA
- It simply reuses the authenticated session from your already-running Chrome
- Ensure you're using this tool responsibly and in accordance with your organization's security policies
- Cookie values are sensitive data - handle them securely

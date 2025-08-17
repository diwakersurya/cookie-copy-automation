# Cookie Copy CLI - Structure Overview

## Project Structure
```
cookie-copy/
├── 📁 src/
│   ├── 📄 cli.js          # CLI entry point with commander.js
│   └── 📄 index.js        # Core functionality (grabCookie, showConfig)
├── 📄 package.json        # Project metadata & dependencies
├── 📄 README.md           # Comprehensive documentation
├── 📄 INSTALLATION.md     # Installation guide
├── 📄 env.example         # Environment variables template
├── 📄 test-cli.js         # CLI functionality tests
└── 📄 .gitignore          # Git ignore patterns
```

## CLI Command Structure
```
cookie-copy [global-options] <command> [command-options]

┌─────────────────────────────────────────────────────────────┐
│                    Global Options                           │
├─────────────────────────────────────────────────────────────┤
│  -V, --version    Show version number                      │
│  -h, --help       Show help information                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       Commands                              │
├─────────────────────────────────────────────────────────────┤
│  grab [options]   Extract cookie from Chrome instance      │
│  config           Show current configuration               │
│  help [command]   Show help for specific command          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Grab Command Options                     │
├─────────────────────────────────────────────────────────────┤
│  -u, --cdp-url <url>           Chrome DevTools URL         │
│  -s, --start-url <url>         Starting URL                │
│  -c, --cookie-name <name>      Cookie name to extract      │
│  -e, --expect-url <substring>  Expected URL substring      │
│  -a, --agency <agency>         Agency name                 │
│  -p, --project <project>       Project name                │
│  --custom-select-open <sel>    Custom dropdown selector    │
│  --custom-select-option <sel>  Custom option selector      │
│  --login-ul-selector <sel>     Login UL selector           │
│  --login-anchor-selector <sel> Login anchor selector       │
│  --submit-button <sel>         Submit button selector      │
│  --pick-tab-url <substring>    Tab URL filter              │
│  --pick-tab-title <substring>  Tab title filter            │
│  --nav-timeout <ms>            Navigation timeout          │
│  --idle-timeout <ms>           Idle timeout                │
│  -v, --verbose                 Enable verbose logging      │
│  -q, --quiet                   Suppress info messages      │
│  --no-clipboard                Don't copy to clipboard     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Chrome    │    │   CLI Tool  │    │   Output    │
│   Browser   │◄──►│  (Playwright)│───►│  (JSON)     │
│   (CDP)     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Remote     │    │  Cookie     │    │  Clipboard  │
│  Debugging  │    │  Extraction │    │  Copy       │
│  Port 9222  │    │  & Actions  │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Configuration Sources (Priority Order)
```
1. CLI Arguments (highest priority)
   ↓
2. Environment Variables (.env file)
   ↓
3. Default Values (lowest priority)
```

## Exit Codes
```
┌─────────────┬─────────────────────────────────────────────┐
│ Exit Code   │ Description                                 │
├─────────────┼─────────────────────────────────────────────┤
│     0       │ Success - Cookie extracted and copied      │
│     1       │ Error - General error (connection, etc.)   │
│     2       │ Error - Cookie not found                   │
└─────────────┴─────────────────────────────────────────────┘
```

## Usage Examples
```
┌─────────────────────────────────────────────────────────────┐
│                    Basic Usage                              │
├─────────────────────────────────────────────────────────────┤
│ cookie-copy grab                                           │
│ cookie-copy grab --cookie-name sessionId                   │
│ cookie-copy grab --verbose                                 │
│ cookie-copy config                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Advanced Usage                             │
├─────────────────────────────────────────────────────────────┤
│ cookie-copy grab \                                         │
│   --cdp-url http://localhost:9222 \                        │
│   --start-url https://admin.example.com/login \            │
│   --cookie-name sosense \                                  │
│   --expect-url /dashboard \                                │
│   --verbose                                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Script Usage                              │
├─────────────────────────────────────────────────────────────┤
│ cookie-copy grab --quiet --no-clipboard | jq -r '.value'   │
└─────────────────────────────────────────────────────────────┘
```

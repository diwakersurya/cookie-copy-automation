# Cookie Copy CLI - Structure Overview

## Project Structure
```
cookie-copy/
├── 📁 src/
│   ├── 📄 cli.js          # CLI entry point with commander.js
│   ├── 📄 index.js        # Core functionality (grabCookie, showConfig)
│   └── 📄 chrome-manager.js # Chrome process management & CDP detection
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
│  start-chrome     Start Chrome with CDP enabled            │
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
│  --auto-start-chrome           Auto-start Chrome if needed │
│  --chrome-port <port>          Chrome debugging port       │
│  --chrome-user-data-dir <path> Chrome user data directory  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Start-Chrome Command Options                 │
├─────────────────────────────────────────────────────────────┤
│  -p, --port <port>       Chrome debugging port             │
│  --user-data-dir <path>  Chrome user data directory        │
│  -v, --verbose           Enable verbose logging            │
│  --check-only            Only check Chrome status          │
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
│  Chrome     │    │  Cookie     │    │  Clipboard  │
│  Manager    │    │  Extraction │    │  Copy       │
│  (Auto)     │    │  & Actions  │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Chrome Management Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Check CDP     │───►│   Chrome        │───►│   Start Chrome  │
│   Connection    │    │   Found?        │    │   with CDP      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDP Ready     │    │   Try Chrome    │    │   Wait for CDP  │
│   ✓ Continue    │    │   Canary/Stable │    │   Connection    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
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
│ cookie-copy grab --auto-start-chrome                       │
│ cookie-copy start-chrome                                   │
│ cookie-copy start-chrome --check-only                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Advanced Usage                             │
├─────────────────────────────────────────────────────────────┤
│ cookie-copy grab \                                         │
│   --auto-start-chrome \                                    │
│   --chrome-port 9223 \                                     │
│   --start-url https://admin.example.com/login \            │
│   --cookie-name sosense \                                  │
│   --verbose                                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Chrome Management                          │
├─────────────────────────────────────────────────────────────┤
│ cookie-copy start-chrome --port 9223 --verbose             │
│ cookie-copy start-chrome --user-data-dir "/custom/profile" │
│ cookie-copy grab --chrome-user-data-dir "/path/to/profile" │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Script Usage                              │
├─────────────────────────────────────────────────────────────┤
│ cookie-copy grab --quiet --no-clipboard | jq -r '.value'   │
└─────────────────────────────────────────────────────────────┘
```

## Chrome Detection & Startup
```
┌─────────────────────────────────────────────────────────────┐
│                    Platform Support                         │
├─────────────────────────────────────────────────────────────┤
│  macOS:     Chrome Canary, Chrome Stable                   │
│  Linux:     google-chrome-canary, google-chrome            │
│  Windows:   Chrome SxS, Chrome Stable                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Chrome Arguments                         │
├─────────────────────────────────────────────────────────────┤
│  --remote-debugging-port=<port>                            │
│  --no-first-run                                            │
│  --no-default-browser-check                                │
│  --disable-default-apps                                    │
│  --disable-popup-blocking                                  │
│  --disable-web-security                                    │
│  --user-data-dir=<path> (optional)                         │
└─────────────────────────────────────────────────────────────┘
```

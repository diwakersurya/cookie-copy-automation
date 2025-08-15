
# okta-cdp-attach

Attach to an **already running Chrome** (started with `--remote-debugging-port`) using **Playwright's `connectOverCDP`**, without launching a new browser or new profile. This **reuses the existing Okta session** so you don't need to log in again.

## 1) Start Chrome with remote debugging (once)
**macOS**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \  --remote-debugging-port=9222
```
**Linux**
```bash
google-chrome --remote-debugging-port=9222
```
**Windows (PowerShell)**
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --remote-debugging-port=9222
```

> Use the *same* Chrome window you're already logged into via Okta. No new profile is created; we attach to that session.

## 2) Configure
Copy `.env.example` to `.env` and adjust as needed:
```bash
cp .env.example .env
```

- `CDP_URL` — typically `http://localhost:9222`.
- `START_URL` — a URL to open if no suitable tab exists (keeps your cookies/session).
- `EXPECT_URL_INCLUDES` — substring used to confirm landing.
- `COOKIE_NAME` — cookie to extract.
- Selectors: adjust to match your DOM.

## 3) Install & run
```bash
npm i
npm run grab
```

Outputs the cookie JSON to stdout.

### Notes
- If you don't see your cookie, ensure the cookie is scoped to the domain you navigated to and that the running Chrome really has a valid session.
- This does **not** bypass MFA. It simply reuses the authenticated session from your already-running Chrome.

#### use this command to start chrome canary in CDP mode
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/Library/Application Support/Google/Chrome Canary/Default"

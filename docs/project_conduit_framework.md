---
name: conduit-qa-framework setup
description: Current state of the Playwright automation framework for Conduit (demo.realworld.show)
type: project
---

Playwright + TypeScript framework built from scratch in `/Users/camilagimenez/Desktop/conduit-qa-framework/` to automate https://demo.realworld.show/.

**Why:** The user wants an automated QA framework for the Conduit app (RealWorld demo), starting with the 3 smoke cases from TestPlan_Conduit.docx.

**How to apply:** When continuing this project, read the existing files before proposing changes. The framework is functional and ready for `npm install`.

## Generated Structure
- `e2e/pages/` — Page Object Models: BasePage, HomePage, LoginPage, RegisterPage, EditorPage
- `e2e/tests/` — 3 smoke specs: SMK-01_register, SMK-02_login, SMK-03_create-article
- `e2e/fixtures/index.ts` — fixtures with storageState for auth
- `e2e/utils/` — helpers.ts (random generators), test-data.ts (user and article data)
- `global-setup.ts` — creates user via API (idempotent) + saves UI session in .auth/session.json
- `playwright.config.ts`, `package.json`, `tsconfig.json`, `jest.config.ts`
- `.github/workflows/` — playwright.yml and jest.yml with artifact upload

## Implemented Test Cases
| ID | Description | Req |
|----|-------------|-----|
| SMK-01 | Register new user | FR-01 / TC-001 |
| SMK-02 | Login with valid credentials | FR-03 / TC-006 |
| SMK-03 | Create article with all fields | FR-09 / TC-030 |
| E2E-18 | Redirect unauthenticated user when attempting to access /editor | NFR-05 / TC-012 |
| REG-02 | Author deletes their own article | FR-12 / TC-038 |

## Key Technical Decisions
- Skill used: `playwright-framework-generator` (created by the user with skill-creator, located in `/Users/camilagimenez/.claude/plugins/cache/claude-plugins-official/skill-creator/205b6e0b3036/skills/playwright-framework-generator/`)
- Base API: `https://api.realworld.io/api`
- `global-setup.ts` uses Playwright's `request.newContext()` to create the user via `POST /api/users` before the UI login
- If the user already exists ("already taken"), the setup ignores it and continues — idempotent behavior
- SMK-03 uses `editorPage` fixture which loads `.auth/session.json` (session saved by global-setup)
- All locators are user-facing (getByRole, getByPlaceholder, getByText) — no CSS or XPath
- Environment variables: BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_USERNAME

## Subsequent Changes

### Dynamic user creation
- `global-setup.ts` generates a unique user per run using timestamp (`qa_user_<timestamp>` / `qa_<timestamp>@test.com`)
- Creates the user via `POST https://api.realworld.show/api/users` before the UI login
- Saves credentials in `.auth/test-user.json` so tests can read them at runtime
- `e2e/utils/test-data.ts` uses a getter that reads `.auth/test-user.json` instead of hardcoded values
- `.auth/test-user.json` added to `.gitignore`

### Fix: Incorrect API URL + JSON error
- **Cause**: The URL `https://api.realworld.io/api` returned 530 (it's not the backend for demo.realworld.show)
- **Correct URL**: `https://api.realworld.show/api` (found in the app's `main-ORWI2NM2.js` JS bundle)
- **Additional Fix**: full URL is used in `post()` (`${API_BASE}/users`) instead of relative path, because Playwright with `baseURL: 'https://api.realworld.show/api'` + `/users` resolved to `https://api.realworld.show/users` (without `/api`)

### Fix: cannot find module dotenv
- Removed `import dotenv from 'dotenv'` from `playwright.config.ts` (Playwright loads `.env` automatically since v1.44)
- Removed `setupFiles: ['dotenv/config']` from `jest.config.ts`
- Removed `dotenv` from devDependencies in `package.json`

### Fix: Hash routing URLs in all Pages
- Removed `/#/` prefix from all POMs and global-setup — Playwright does not navigate correctly with hash routing using that format
- Fixed files:
  - `LoginPage.ts`: `'/#/login'` → `'/login'`
  - `RegisterPage.ts`: `'/#/register'` → `'/register'`
  - `HomePage.ts`: `'/#/'` → `'/'`
  - `EditorPage.ts`: `'/#/editor'` → `'/editor'`
  - `global-setup.ts`: Hardcoded URL `/#/login` → `/login`

### Fix: Login verification in SMK-02
- Replaced URL check (`toHaveURL(/\/#\/?$/)`) with a more robust verification
- Now API response is intercepted with `waitForResponse` and it validates that `POST /users/login` returns status `200`
- DOM checks are maintained: "Your Feed" tab visible and username in navigation
- Reason: directly validating the backend response is more reliable than relying on the URL pattern after redirect

### Refactor: storageState for authentication in SMK-03
- `editorPage` fixture in `fixtures/index.ts` uses `storageState: '.auth/session.json'` (saved by global-setup) — SMK-03 starts authenticated without going through login in the test
- Cleaned `AppFixtures` typing: removed `authenticatedPage` (invalid type) and left only `editorPage: EditorPage`
- `BasePage.ts`: `page` changed from `protected` to public `readonly` so specs can access it directly like `editorPage.page`
- Replaced `['page']` access (bracket notation) with `.page` in all three specs (SMK-01, SMK-02, SMK-03)

### Fix: incorrect placeholders in RegisterPage
- Placeholders in `RegisterPage.ts` did not match those in the app's real DOM
- Changes applied by the user:
  - `'Your Username'` → `'Username'`
  - `'Your Email'` → `'Email'`
  - `'Password'` remained the same
- Lesson: always verify actual placeholders by inspecting the DOM before assuming values

### Fix: Registration verification in SMK-01
- Replaced URL check (`toHaveURL(/\/#\/?$/)`) with API response interception
- Now uses `waitForResponse` to capture `POST /api/users` and verify it returns status `200`
- DOM checks are maintained: "New Article" link and username visible in navigation
- Consistent with the same pattern applied in SMK-02 for login

### Fix: storageState was not working for authentication in SMK-03
- **Symptom**: user appeared logged out when navigating to the editor even though `session.json` existed
- **Root cause**: Angular initializes its auth state in memory when the app starts. The `storageState` captured via UI login saved localStorage AFTER Angular had already read its state — when restoring it in a new context, the app ignored it
- **Fix in `global-setup.ts`**:
  - Removed UI login for saving session
  - JWT token is directly extracted from the response `POST /api/users` (`user.token` field)
  - Manually builds `.auth/session.json` with that token in `localStorage['jwtToken']`
  - Playwright injects the state BEFORE Angular boots — the app reads it correctly in its init cycle
- **Fix in `fixtures/index.ts`**:
  - Explicitly passes `baseURL` to `browser.newContext()` of `editorPage` fixture
  - Without this, `page.goto('/editor')` could not resolve the URL correctly
  - Removed unnecessary `Browser` import

### Fix: 401 in SMK-03 when running the full suite
- **Symptom**: SMK-03 passed alone but failed with 401 when running the full suite in parallel
- **Root cause**: SMK-02 was logging in the same user created by global-setup. The backend issued a new token on each login, invalidating the previous token saved in `session.json` which SMK-03 was using
- **Fix in SMK-02**: the test now creates its own user via `POST /api/users` before logging in, using unique credentials with a timestamp — completely independent from the global-setup user
- **Fix in SMK-03**: added interception of `POST /api/articles` with `waitForResponse` filtering non-redirect responses, verifying status 201
- **Lesson**: each test should own its data — if two tests share the same user, they can interfere with each other when running in parallel

### New test: E2E-18 — Unauthorized Access to Editor
- File: `e2e/tests/E2E-18_unauthorized-editor-access.spec.ts`
- Automates TC-012 / E2E-18 from TestPlan: unauthenticated user cannot access `/editor`
- Context starts without session (no auth fixtures used)
- Verifies: redirect away from `/editor`, landing on home or `/login`, nav shows "Sign in"/"Sign up", "New Article" not visible
- Tagged `@smoke` — passes in full suite (4/4)
- Note: user called it "SEC-01" but in the TestPlan that ID corresponds to XSS. The case for redirect without login is TC-012 / E2E-18

### New test: REG-02 — Delete Own Article
- File: `e2e/tests/REG-02_delete-article.spec.ts`
- Automates TC-038 / FR-12: author can delete their own article
- Tagged `@regression`
- New POM: `e2e/pages/ArticlePage.ts` (title, deleteButton, editButton, authorLink)
  - `deleteButton` uses `.first()` because the button appears twice on the page (banner + below body)
- New fixture `authPage` in `fixtures/index.ts`: authenticated page without initial URL, reusable for tests that navigate to dynamic routes
- Test flow:
  1. Creates article via `POST /api/articles` with the token from `.auth/session.json`
  2. Navigates to `/article/:slug` with authenticated session
  3. Verifies "Delete Article" button is visible (author view)
  4. Click delete + intercepts `DELETE /api/articles/:slug` → verifies status 204
  5. Verifies redirect away from the article page
  6. Confirms via `GET /api/articles/:slug` that it returns 404
- Full suite: 5/5 passing

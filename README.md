# Conduit QA Framework

A production-ready [Playwright](https://playwright.dev/) + TypeScript end-to-end testing framework built for the [Conduit App](https://demo.realworld.show/). 

This repository was designed starting with the RealWorld demo application. The framework implements modern testing standards, specifically optimized for speed, reliability, and robust authentication handling.

## 🚀 Features

- **Language & tooling**: Powered by [TypeScript](https://www.typescriptlang.org/) and built on top of Playwright.
- **Design Pattern**: Page Object Model (POM) architecture to keep code clean and maintainable.
- **Flaky-free Assertions**: Heavy focus on validating backend requests and `waitForResponse` intercepts rather than flaky DOM parsing, especially across cross-site navigations and redirects.
- **Smart & Global Auth Management**: 
  - Dynamic user provisioning via REST APIs (to avoid data collision when checking parallel tests).
  - Storage State caching loaded from `.auth/session.json`. Playwright injects the auth token directly into the `localStorage` enabling lightning-fast authenticated browser sessions and bypassing log in flows.
- **Clean Structure**: Helpers, random data generators, and cleanly defined user-facing DOM selectors (combining `getByRole`, `getByText`, etc.).
- **CI/CD Integrated**: Configured to run in parallel on GitHub Actions on every Pull Request to `main` and `develop`.

---

## 📂 Project Structure

```text
├── .github/workflows/       # GitHub Actions YAML to execute suite in CI (e.g. playwright.yml)
├── e2e/                     # End-to-end framework
│   ├── fixtures/            # Custom fixtures extending the Playwright 'test' object
│   ├── pages/               # Page Object Models (e.g., LoginPage, EditorPage, HomePage)
│   ├── tests/               # The actual test spec files containing execution logic
│   └── utils/               # Utilities, test data, and random generator scripts
├── global-setup.ts          # Root-level configuration to pre-provision an auth state
├── playwright.config.ts     # Core Playwright configuration (timeouts, environments, reporters)
├── package.json             # NPM dependencies & scripts mapping
└── tsconfig.json            # TypeScript language server definitions
```

---

## 🧪 Test Coverage Scenarios

The framework currently runs the following functional and regression test specifications:

| ID | Suite | Description |
|---|---|---|
| SMK-01 | `@smoke` | Creates a new user sequentially navigating through `/register` to the homepage. |
| SMK-02 | `@smoke` | Login logic parsing real response statuses over `POST /api/users/login`. |
| SMK-03 | `@smoke` | Asserts a user can create an article. Tests loaded dynamically skipping UI Auth (Injecting `.auth/session.json`). |
| E2E-18 | `@smoke` | Redirects non-authenticated users seeking to access the `/editor` panel directly. |
| REG-02 | `@regression` | Ensures authorship ownership, empowering authors to fully delete items they published from the DOM. |

---

## 🏁 Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) (version 20.x+) installed globally in your system.

### 1. Install dependencies

```bash
npm install
```

### 2. Install browsers

```bash
npx playwright install --with-deps
```

### 3. Run the Tests

Execute tests in headless mode (perfect for CI):
```bash
npm run test:e2e
```

**Additional Commands:**
- Run only `@smoke` specs: `npm run test:e2e:smoke`
- Run only `@regression` specs: `npm run test:e2e:regression`
- View execution in UI Mode: `npm run test:e2e:ui`
- View in Headed mode (opens browsers): `npm run test:e2e:headed`
- Run with the Inspector debugger: `npm run test:e2e:debug`
- View the HTML Report from the last run: `npm run report`

---

## ⚙️ Environment Configuration

There's no need to handle manual `.env` file parsing as Playwright 1.44+ ships out-of-the-box support. Ensure the following fallback environment logic is matched (or overridden natively if exporting dynamically):

- `BASE_URL`: `https://api.realworld.show`
- User auth tokens and variables run completely automatically using the dynamic fixture implementations combined within `global-setup.ts`. 

*(Environment variables are generally generated iteratively inside the test runner process and cleaned up afterward)*.

---

## 🤖 AI Usage & Project Memory

This entire framework was initially generated and iteratively refined using AI, specifically leveraging **Claude** and an authored custom skill: `playwright-framework-generator`. 

The development methodology is actively tracked in a project-bound markdown memory file ([project_conduit_framework.md](docs/project_conduit_framework.md)). This enables the AI to:
1. Retain context across debugging sessions.
2. Recall the project structure without requiring the developer to re-explain it.
3. Automatically track lessons learned—such as the refactoring to unique timestamps in global user provisioning (to mitigate data collision) and the shift toward using `waitForResponse` intercepts for stable state validation.

The [project_conduit_framework.md](docs/project_conduit_framework.md) ensures Claude understands *why* architectural decisions were made, keeping future iterations aligned with the existing codebase patterns.

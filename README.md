# 🌐 Conduit QA Framework

[![Playwright](https://img.shields.io/badge/Playwright-v1.44+-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

End-to-end automation framework built for the [Conduit (RealWorld)](https://demo.realworld.show/) application. This repository leverages modern QA engineering best practices to deliver a stable, fast, and scalable testing solution.

---

## ✨ Key Features

- **🎯 Strategic Architecture**: Page Object Model (POM) design pattern for high maintainability and code reuse.
- **⚡ Lightning-Fast Auth**: storageState caching directly in `localStorage` — bypassing UI login for authenticated tests to reach stable states 3-4x faster.
- **🛡️ Flaky-Resistant**: Uses `waitForResponse` intercepts to validate backend state instead of relying on unpredictable DOM racing.
- **📦 Clean Test Data**: Zero-dependency uniqueness strategy using dynamic `Date.now()` suffixes to guarantee data isolation in parallel runs.
- **📊 Traceability & Debugging**: Automatic artifacts on failure — HTML reports, screenshots, and execution traces for rapid root-cause analysis.
- **🚀 CI/CD Ready**: Fully configured for headless parallel execution via GitHub Actions.

---

## 📂 Project Navigation

```mermaid
graph TD;
    Root["/"] --> CI[".github/workflows"]
    Root --> Docs["docs/"]
    Root --> E2E["e2e/"]
    E2E --> Fix["fixtures/"]
    E2E --> Pages["pages/"]
    E2E --> Tests["tests/"]
    E2E --> Utils["utils/"]
    Root --> Config["playwright.config.ts"]
    Root --> Setup["global-setup.ts"]
```

---

## 🏁 Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v20.x+) installed.

### 2. Installation
```bash
# Install dependencies
npm install

# Install Playwright browser engines
npx playwright install --with-deps
```

### 3. Execution
| Goal | Command |
|---|---|
| Run all tests | `npm run test:e2e` |
| Smoke suite only | `npm run test:e2e:smoke` |
| Regression suite only | `npm run test:e2e:regression` |
| Interactive UI Mode | `npm run test:e2e:ui` |
| Debugging Inspector | `npm run test:e2e:debug` |
| Last HTML Report | `npm run report` |

---

## ⚙️ Environment Configuration

Playwright handles environment variables natively. Key variables include:

- **`BASE_URL`**: `https://demo.realworld.show` (The UI entry point)
- **`API_BASE_URL`**: `https://api.realworld.show` (Used for background user provisioning)

*Note: Auth tokens and dynamic test users are provisioned automatically via `global-setup.ts` into `.auth/session.json`.*

---

## 🤖 AI-Native Development & Memory

This entire framework was initially generated and iteratively refined using AI, specifically leveraging **Claude** and an authored custom skill: `playwright-framework-generator`. 

The development methodology is actively tracked in a project-bound markdown memory file ([project_conduit_framework.md](docs/project_conduit_framework.md)). This enables the AI to:
1. Retain context across debugging sessions.
2. Recall the project structure without requiring the developer to re-explain it.
3. Automatically track lessons learned—such as the refactoring to unique timestamps in global user provisioning (to mitigate data collision) and the shift toward using `waitForResponse` intercepts for stable state validation.

The [project_conduit_framework.md](docs/project_conduit_framework.md) ensures Claude understands *why* architectural decisions were made, keeping future iterations aligned with the existing codebase patterns.

Also, I leveraged AI to perform Reverse Engineering on the Conduit application's requirements. We co-created a comprehensive list of Happy Paths, Edge Cases, and Failure Paths, which are documented in the [scenario_inventory] file.

The use of AI in this project acted as a productivity catalyst, enabling a senior-level architectural design and comprehensive documentation while maintaining full human oversight and manual code validation.


---
## 📂  Docs : Test Strategy Blueprint and Scenario Inventory

You can find both files on [docs/](docs/) folder



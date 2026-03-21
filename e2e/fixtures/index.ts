import { test as base, expect, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { EditorPage } from '../pages/EditorPage';

type AppFixtures = {
  homePage: HomePage;
  registerPage: RegisterPage;
  loginPage: LoginPage;
  editorPage: EditorPage;
  /** Authenticated page without initial URL — ideal for tests that need to navigate to dynamic routes */
  authPage: Page;
};

export const test = base.extend<AppFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await use(homePage);
  },

  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await registerPage.navigate();
    await use(registerPage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await use(loginPage);
  },

  /**
   * editorPage loads the storageState saved by global-setup.ts
   * (.auth/session.json) to start already authenticated — without going through login in the test.
   */
  authPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext({
      baseURL,
      storageState: '.auth/session.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  editorPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext({
      baseURL,
      storageState: '.auth/session.json',
    });
    const page = await context.newPage();
    const editorPage = new EditorPage(page);
    await editorPage.navigate();
    await use(editorPage);
    await context.close();
  },
});

export { expect };

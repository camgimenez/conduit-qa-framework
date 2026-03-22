import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { createUser } from '../utils/api-helpers';

/**
 * SMK-02 — Registered user sign in
 * Steps: Navigate to Sign in → Enter valid email + password → Submit
 * Expected: API POST /users/login returns 200, "Your Feed" tab visible in DOM
 *
 * Creates its own user via API to avoid interfering with the global-setup session used by SMK-03.
 */
test.describe('SMK-02 | User Sign In', () => {
  test('should sign in with valid credentials and see personal feed @smoke', async ({ page }) => {
    let email: string;
    let username: string;
    let password: string;

    await test.step('create a dedicated test user via API', async () => {
      const user = await createUser();
      ({ email, username, password } = user);
    });

    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    await test.step('verify the Sign in page is displayed', async () => {
      await expect(loginPage.heading).toBeVisible();
    });

    await test.step('fill in credentials and intercept API response', async () => {
      const [response] = await Promise.all([
        loginPage.page.waitForResponse(
          res => res.url().includes('/users/login') && res.request().method() === 'POST'
        ),
        loginPage.login(email, password),
      ]);

      await test.step('verify API returns 200', async () => {
        expect(response.status()).toBe(200);
      });
    });

    await test.step('verify "Your Feed" tab is visible (authenticated state)', async () => {
      await expect(loginPage.page.getByRole('link', { name: 'Your Feed' })).toBeVisible();
    });

    await test.step('verify username appears in navigation', async () => {
      await expect(loginPage.page.getByRole('link', { name: username })).toBeVisible();
    });
  });
});

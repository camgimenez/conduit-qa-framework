import { test, expect } from '../fixtures';
import { generateRandomEmail, generateUsername } from '../utils/helpers';

/**
 * SMK-01 — New user registration
 * Req: FR-01 | TC-001
 * Steps: Fill username, email, password → Submit
 * Expected: API POST /users returns 200, "New Article" link and username visible in nav
 */
test.describe('SMK-01 | User Registration', () => {
  test('should register a new user and land on the home feed @smoke', async ({ registerPage }) => {
    const username = generateUsername();
    const email = generateRandomEmail();
    const password = 'Test123!';

    await test.step('verify the Sign up page is displayed', async () => {
      await expect(registerPage.heading).toBeVisible();
    });

    await test.step('fill in registration form and intercept API response', async () => {
      const [response] = await Promise.all([
        registerPage.page.waitForResponse(
          res => res.url().includes('/api/users') && res.request().method() === 'POST'
        ),
        registerPage.register(username, email, password),
      ]);

      await test.step('verify API returns 201', async () => {
        expect(response.status()).toBe(201);
      });
    });

    await test.step('verify the user is logged in (nav shows New Article link)', async () => {
      await expect(registerPage.page.getByRole('link', { name: 'New Article' })).toBeVisible();
    });

    await test.step('verify the username appears in the navigation', async () => {
      await expect(registerPage.page.getByRole('link', { name: username })).toBeVisible();
    });
  });
});

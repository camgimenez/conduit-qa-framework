import { test, expect } from '@playwright/test';

/**
 * SEC-01— Unauthenticated user cannot access /editor
 * Steps: Navigate to /editor without being logged in
 * Expected: Redirect away from /editor (to home or /login), nav shows Sign In / Sign Up
 * This test does not use any auth fixture — the context starts completely clean
 * to guarantee that there is no previous session.
 */
test.describe('SEC-01 | Unauthorized Access to Editor', () => {
  test('should redirect unauthenticated user away from /editor @smoke', async ({ page }) => {

    await test.step('navigate to /editor without a session', async () => {
      await page.goto('/editor');
      await page.waitForLoadState('domcontentloaded');
    });

    await test.step('verify the user is NOT on the editor page (redirect occurred)', async () => {
      await expect(page).not.toHaveURL(/\/editor/);
    });

    await test.step('verify the user lands on home or login page', async () => {
      const url = page.url();
      const isHome = url.endsWith('/') || url.endsWith('/#/');
      const isLogin = url.includes('/login');
      expect(
        isHome || isLogin,
        `Expected redirect to home or /login, but got: ${url}`
      ).toBe(true);
    });

    await test.step('verify nav shows Sign In and Sign Up (unauthenticated state)', async () => {
      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
    });

    await test.step('verify authenticated links are NOT visible', async () => {
      await expect(page.getByRole('link', { name: 'New Article' })).not.toBeVisible();
    });
  });
});

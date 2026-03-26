import { test, expect } from '../fixtures';
import { testData } from '../utils/test-data';

/**
 * SMK-03 — Create a new article
 * Steps: (authenticated) Navigate to New Article → Fill title, description, body, tags → Publish
 * Expected: Article created → redirect to article view page showing the new content
 *
 * This test uses the `editorPage` fixture which loads the saved auth session
 * from global-setup.ts — no per-test login required.
 */
test.describe('SMK-03 | Create Article', () => {
  test('should create a new article with all fields and redirect to article view @smoke', async ({ editorPage }) => {
    const { title, description, body, tagList } = testData.sampleArticle;
    // Use a timestamp to ensure unique titles across runs
    const uniqueTitle = `${title} ${Date.now()}`;

    await test.step('verify the Article Editor page is displayed', async () => {
      await expect(editorPage.titleInput).toBeVisible();
    });

    await test.step('fill in article title', async () => {
      await editorPage.titleInput.fill(uniqueTitle);
    });

    await test.step('fill in article description', async () => {
      await editorPage.descriptionInput.fill(description);
    });

    await test.step('fill in article body', async () => {
      await editorPage.bodyInput.fill(body);
    });

    await test.step('add tags', async () => {
      for (const tag of tagList) {
        await editorPage.addTag(tag);
      }
    });

    await test.step('publish the article and verify API response', async () => {
      const [response] = await Promise.all([
        editorPage.page.waitForResponse(
          res =>
            res.url().includes('/api/articles') &&
            res.request().method() === 'POST' &&
            !res.status().toString().startsWith('3')
        ),
        editorPage.publishButton.click(),
      ]);

      const status = response.status();
      expect(status, `API /articles returned unexpected status ${status}`).toBe(201);
    });

    await test.step('verify redirect to the newly created article view', async () => {
      await expect(editorPage.page).toHaveURL(/\/article\//);
    });

    await test.step('verify article title is displayed on the article page', async () => {
      await expect(editorPage.page.getByRole('heading', { name: uniqueTitle })).toBeVisible();
    });

    await test.step('verify tags are shown on the article page', async () => {
      for (const tag of tagList) {
        await expect(editorPage.page.getByText(tag, { exact: true })).toBeVisible();
      }
    });
  });
});

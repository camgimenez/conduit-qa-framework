import { test, expect } from '../fixtures';
import { ArticlePage } from '../pages/ArticlePage';
import { API_BASE, getAuthToken, createArticle } from '../utils/api-helpers';
import { request } from '@playwright/test';
import { testData } from '../utils/test-data';

/**
 * REG-02 — Author deletes their own article
 * Steps: (authenticated) Create article via API → Navigate to article → Click Delete → Confirm gone
 * Expected: Article deleted → redirect away from article page → article no longer accessible
 */
test.describe('REG-02 | Delete Own Article', () => {
  test('should delete own article and confirm it is no longer accessible @regression', async ({ authPage }) => {
    const token = getAuthToken();
    let slug: string;

    await test.step('create a test article via API', async () => {
      const { title, description, body, tagList } = testData.sampleArticle;
      const article = await createArticle(token, {
        title: `${title} - Delete Test ${Date.now()}`,
        description,
        body,
        tagList,
      });
      slug = article.slug!;
    });

    const articlePage = new ArticlePage(authPage, slug!);

    await test.step('navigate to the article page', async () => {
      await articlePage.navigate();
      await expect(articlePage.title).toBeVisible();
    });

    await test.step('verify delete button is visible (author view)', async () => {
      await expect(articlePage.deleteButton).toBeVisible();
    });

    await test.step('click delete and verify API returns 204', async () => {
      const [response] = await Promise.all([
        authPage.waitForResponse(
          res =>
            res.url().includes(`/api/articles/${slug}`) &&
            res.request().method() === 'DELETE'
        ),
        articlePage.deleteButton.click(),
      ]);
      expect(response.status(), 'DELETE /api/articles/:slug should return 204').toBe(204);
    });

    await test.step('verify redirect away from the deleted article', async () => {
      await expect(authPage).not.toHaveURL(new RegExp(`/article/${slug}`));
    });

    await test.step('verify article is no longer accessible via API', async () => {
      const apiContext = await request.newContext();
      const res = await apiContext.get(`${API_BASE}/articles/${slug}`);
      expect(res.status(), 'Deleted article should return 404').toBe(404);
      await apiContext.dispose();
    });
  });
});

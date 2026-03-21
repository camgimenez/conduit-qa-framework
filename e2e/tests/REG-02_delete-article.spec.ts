import { test, expect, request } from '@playwright/test';
import { ArticlePage } from '../pages/ArticlePage';
import { API_BASE, getAuthToken, createArticle } from '../utils/api-helpers';

/**
 * REG-02 — Author deletes their own article
 * Req: FR-12 | TC-038
 * Steps: (authenticated) Create article via API → Navigate to article → Click Delete → Confirm gone
 * Expected: Article deleted → redirect away from article page → article no longer accessible
 */
test.describe('REG-02 | Delete Own Article', () => {
  test('should delete own article and confirm it is no longer accessible @regression', async ({ browser, baseURL }) => {
    const token = getAuthToken();
    let slug: string;

    await test.step('create a test article via API', async () => {
      const article = await createArticle(token, {
        title: `Article to delete ${Date.now()}`,
        description: 'Created by REG-02 automation test',
        body: 'This article will be deleted as part of the test.',
        tagList: ['delete-test'],
      });
      slug = article.slug!;
    });

    const context = await browser.newContext({
      baseURL,
      storageState: '.auth/session.json',
    });
    const page = await context.newPage();
    const articlePage = new ArticlePage(page, slug!);

    await test.step('navigate to the article page', async () => {
      await articlePage.navigate();
      await expect(articlePage.title).toBeVisible();
    });

    await test.step('verify delete button is visible (author view)', async () => {
      await expect(articlePage.deleteButton).toBeVisible();
    });

    await test.step('click delete and verify API returns 204', async () => {
      const [response] = await Promise.all([
        page.waitForResponse(
          res =>
            res.url().includes(`/api/articles/${slug}`) &&
            res.request().method() === 'DELETE'
        ),
        articlePage.deleteButton.click(),
      ]);
      expect(response.status(), 'DELETE /api/articles/:slug should return 204').toBe(204);
    });

    await test.step('verify redirect away from the deleted article', async () => {
      await expect(page).not.toHaveURL(new RegExp(`/article/${slug}`));
    });

    await test.step('verify article is no longer accessible via API', async () => {
      const apiContext = await request.newContext();
      const res = await apiContext.get(`${API_BASE}/articles/${slug}`);
      expect(res.status(), 'Deleted article should return 404').toBe(404);
      await apiContext.dispose();
    });

    await context.close();
  });
});

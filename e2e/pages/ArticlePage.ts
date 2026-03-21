import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ArticlePage extends BasePage {
  readonly title: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly authorLink: Locator;

  constructor(page: Page, slug: string) {
    super(page, `/article/${slug}`);
    this.title = page.getByRole('heading', { level: 1 });
    this.deleteButton = page.getByRole('button', { name: 'Delete Article' }).first();
    this.editButton = page.getByRole('link', { name: 'Edit Article' });
    this.authorLink = page.locator('.author');
  }
}

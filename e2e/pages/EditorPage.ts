import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class EditorPage extends BasePage {
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagInput: Locator;
  readonly publishButton: Locator;
  readonly tagList: Locator;

  constructor(page: Page) {
    super(page, '/editor');
    this.titleInput = page.getByPlaceholder('Article Title');
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder('Write your article (in markdown)');
    this.tagInput = page.getByPlaceholder('Enter tags');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
    this.tagList = page.locator('.tag-list');
  }

  async addTag(tag: string): Promise<void> {
    await this.tagInput.fill(tag);
    await this.tagInput.press('Enter');
  }

  async publish(title: string, description: string, body: string, tags: string[] = []): Promise<void> {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.bodyInput.fill(body);
    for (const tag of tags) {
      await this.addTag(tag);
    }
    await this.publishButton.click();
  }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly banner: Locator;
  readonly globalFeedTab: Locator;
  readonly yourFeedTab: Locator;
  readonly navSignIn: Locator;
  readonly navSignUp: Locator;
  readonly navNewArticle: Locator;
  readonly navSettings: Locator;
  readonly navUserLink: Locator;

  constructor(page: Page) {
    super(page, '/');
    this.banner = page.getByRole('heading', { name: 'conduit' });
    this.globalFeedTab = page.getByRole('link', { name: 'Global Feed' });
    this.yourFeedTab = page.getByRole('link', { name: 'Your Feed' });
    this.navSignIn = page.getByRole('link', { name: 'Sign in' });
    this.navSignUp = page.getByRole('link', { name: 'Sign up' });
    this.navNewArticle = page.getByRole('link', { name: 'New Article' });
    this.navSettings = page.getByRole('link', { name: 'Settings' });
    this.navUserLink = page.locator('nav').getByRole('link').last();
  }

  async isUserLoggedIn(): Promise<boolean> {
    return this.navNewArticle.isVisible();
  }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessages: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    super(page, '/login');
    this.heading = page.getByRole('heading', { name: 'Sign in' });
    this.emailInput = page.locator('[formcontrolname="email"]');
    this.passwordInput = page.locator('[formcontrolname="password"]');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessages = page.locator('.error-messages li');
    this.signUpLink = page.getByRole('link', { name: 'Need an account?' });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

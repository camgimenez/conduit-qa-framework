import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessages: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    super(page, '/register');
    this.heading = page.getByRole('heading', { name: 'Sign up' });
    this.usernameInput = page.locator('[formcontrolname="username"]');
    this.emailInput = page.locator('[formcontrolname="email"]');
    this.passwordInput = page.locator('[formcontrolname="password"]');
    this.submitButton = page.getByRole('button', { name: 'Sign up' });
    this.errorMessages = page.locator('.error-messages li');
    this.signInLink = page.getByRole('link', { name: 'Have an account?' });
  }

  async register(username: string, email: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

import { Page } from '@playwright/test';

export async function waitForNetworkIdle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

export function generateRandomEmail(): string {
  return `test+${Date.now()}@example.com`;
}

export function generateRandomString(length = 8): string {
  return Math.random().toString(36).substring(2, length + 2);
}

export function generateUsername(): string {
  return `user_${Date.now()}`;
}

export function generatePassword(): string {
  return `TestPwd!${Date.now()}`;
}

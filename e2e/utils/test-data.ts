import fs from 'fs';
import path from 'path';

const USER_FILE = path.resolve('.auth/test-user.json');

function loadTestUser(): { username: string; email: string; password: string } {
  if (!fs.existsSync(USER_FILE)) {
    throw new Error(
      `Test user file not found at ${USER_FILE}. Run the full test suite (not a single spec) so global-setup creates it first.`
    );
  }
  return JSON.parse(fs.readFileSync(USER_FILE, 'utf-8'));
}

export const testData = {
  // Common password across tests
  testPassword: 'Test123!',
  
  // Loaded at runtime from .auth/test-user.json (written by global-setup.ts)
  get existingUser() {
    return loadTestUser();
  },

  // Article data for SMK-03
  sampleArticle: {
    title: 'Test Article - Automation',
    description: 'A sample article created by the automation suite',
    body: 'This article was created as part of the Playwright smoke test. It validates the full article creation flow.',
    tagList: ['automation', 'playwright'],
  },
};

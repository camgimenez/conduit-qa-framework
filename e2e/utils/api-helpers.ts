import { request } from '@playwright/test';
import fs from 'fs';
import { generateRandomEmail, generateUsername, generatePassword } from './helpers';
import type { User, Article } from './types';

export const API_BASE = process.env.API_BASE_URL || 'https://api.realworld.show/api';

export function getAuthToken(): string {
  const session = JSON.parse(fs.readFileSync('.auth/session.json', 'utf-8'));
  const token = session.origins?.[0]?.localStorage?.find(
    (e: { name: string }) => e.name === 'jwtToken'
  )?.value;
  if (!token) throw new Error('JWT token not found in .auth/session.json');
  return token;
}

export async function createUser(overrides?: Partial<User>): Promise<User> {
  const user: User = {
    username: overrides?.username ?? generateUsername(),
    email: overrides?.email ?? generateRandomEmail(),
    password: overrides?.password ?? generatePassword(),
  };

  const apiContext = await request.newContext();
  const res = await apiContext.post(`${API_BASE}/users`, {
    headers: { 'Content-Type': 'application/json' },
    data: { user: { username: user.username, email: user.email, password: user.password } },
  });

  if (!res.ok()) {
    const text = await res.text();
    throw new Error(`Failed to create user (${res.status()}): ${text}`);
  }

  const body = await res.json();
  await apiContext.dispose();

  return { ...user, token: body.user.token };
}

export async function createArticle(token: string, overrides?: Partial<Article>): Promise<Article> {
  const article = {
    title: overrides?.title ?? `Test Article ${Date.now()}`,
    description: overrides?.description ?? 'Created by automation',
    body: overrides?.body ?? 'This article was created as part of an automated test.',
    tagList: overrides?.tagList ?? ['automation'],
  };

  const apiContext = await request.newContext();
  const res = await apiContext.post(`${API_BASE}/articles`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    data: { article },
  });

  if (!res.ok()) {
    const text = await res.text();
    throw new Error(`Failed to create article (${res.status()}): ${text}`);
  }

  const body = await res.json();
  await apiContext.dispose();

  return { ...article, slug: body.article.slug };
}

import { chromium, FullConfig, request } from '@playwright/test';
import fs from 'fs';
import { generatePassword } from './e2e/utils/helpers';

const API_BASE = 'https://api.realworld.show/api';
const USER_FILE = '.auth/test-user.json';
const SESSION_FILE = '.auth/session.json';

/**
 * Global setup runs once before all tests:
 * 1. Crea el usuario via API y obtiene el JWT token directamente de la respuesta
 * 2. Guarda las credenciales en .auth/test-user.json
 * 3. Construye .auth/session.json con el token en localStorage —
 *    sin depender del login UI para capturar el estado
 *
 * Por qué este approach: Angular inicializa su estado de auth en memoria al
 * arrancar la app. Si el token se inyecta via storageState ANTES de que Angular
 * cargue, la app lo lee correctamente en su ciclo de init.
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  const suffix = Date.now();
  const username = `qa_user_${suffix}`;
  const email = `qa_${suffix}@test.com`;
  const password = generatePassword();

  // Step 1: Create user via API and extract token from the response
  const apiContext = await request.newContext();
  const registerResponse = await apiContext.post(`${API_BASE}/users`, {
    headers: { 'Content-Type': 'application/json' },
    data: { user: { username, email, password } },
  });

  if (!registerResponse.ok()) {
    const text = await registerResponse.text();
    throw new Error(`Failed to create test user (${registerResponse.status()}): ${text}`);
  }

  const { user } = await registerResponse.json();
  const token: string = user.token;

  console.log(`[global-setup] Test user created: ${username} / ${email}`);
  console.log(`[global-setup] JWT token obtained from API`);
  await apiContext.dispose();

  // Step 2: Save credentials so tests can read them at runtime
  if (!fs.existsSync('.auth')) {
    fs.mkdirSync('.auth', { recursive: true });
  }
  fs.writeFileSync(USER_FILE, JSON.stringify({ username, email, password }, null, 2));

  // Step 3: Build session.json with the token in localStorage
  // Playwright injects this state BEFORE Angular boots,
  // ensuring the app reads it correctly during its initialization cycle
  const sessionState = {
    cookies: [],
    origins: [
      {
        origin: baseURL,
        localStorage: [
          { name: 'jwtToken', value: token },
        ],
      },
    ],
  };

  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionState, null, 2));
  console.log(`[global-setup] Session saved to ${SESSION_FILE}`);
}

export default globalSetup;

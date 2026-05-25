import { execFileSync } from 'child_process';

/**
 * Playwright globalSetup — idempotent admin seed
 *
 * Ensures e2eadmin@goldpet.com exists with correct password and is_active=true
 * before any spec runs. ON CONFLICT DO UPDATE makes it safe to run repeatedly.
 *
 * Precomputed values (key: local-dev-encryption-key-32ch!!):
 *   email_hash = HMAC-SHA256("e2eadmin@goldpet.com")
 *   email      = AES-256-GCM("e2eadmin@goldpet.com", fixed IV)
 *   name       = AES-256-GCM("E2E Admin", fixed IV)
 */

const EMAIL_HASH = 'nHBoyv80fA+0WosAMR0CYpTh9cYU7fV1S+mdg7XWv00=';
const ENCRYPTED_EMAIL = 'AQIDBAUGBwgJCgsMrwrO68HurOOR1ik3Phzr0HEqqZSl+csisDKOBXujoD/4tyyv';
const ENCRYPTED_NAME = 'AQIDBAUGBwgJCgsMjwruquTnqOS/V2ztGeMpT2haKlwXrwyUTg==';
// BCrypt of "Admin!e2e1" (verified match)
const PASSWORD_HASH = '$2b$10$asDflNfvUi3e.W8MiOHpxeou4kpAkLWdWTOXXmdhj/ZoQHlJMk64C';

const SQL = [
  'INSERT INTO admin_users',
  '  (email, email_hash, password_hash, name, role, is_active, must_change_password)',
  'VALUES',
  `  ('${ENCRYPTED_EMAIL}', '${EMAIL_HASH}', '${PASSWORD_HASH}',`,
  `   '${ENCRYPTED_NAME}', 'SUPER_ADMIN', true, false)`,
  'ON CONFLICT (email_hash) DO UPDATE SET',
  '  password_hash        = EXCLUDED.password_hash,',
  '  is_active            = true,',
  '  must_change_password = false,',
  "  role                 = 'SUPER_ADMIN';",
].join('\n');

export default async function globalSetup() {
  execFileSync(
    'psql',
    ['-h', 'localhost', '-p', '5433', '-U', 'goldpet', '-d', 'goldpet', '-c', SQL],
    { env: { ...process.env, PGPASSWORD: 'goldpet123' }, stdio: 'pipe' },
  );
  console.log('[global-setup] e2eadmin seed OK');
}

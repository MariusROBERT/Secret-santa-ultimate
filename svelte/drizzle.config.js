import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  casing: 'snake_case',
  dialect: 'sqlite',
  schema: './src/lib/db/schema.js',
  dbCredentials: { url: 'file:secretSantaUltimate.sql' },
  verbose: true,
  strict: true,
});

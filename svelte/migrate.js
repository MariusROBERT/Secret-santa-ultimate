import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

const client = createClient({ url: process.env.DATABASE_URL ?? 'file:data/secretSantaUltimate.sql' });

try {
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('secret_santa', 'user')",
  );
  const history = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'",
  );
  const historyCount = history.rows.length
    ? await client.execute('SELECT count(*) AS count FROM `__drizzle_migrations`')
    : { rows: [{ count: 0 }] };

  if (tables.rows.length && tables.rows.length !== 2)
    throw new Error('Database has a partial application schema; refusing to migrate it.');

  if (tables.rows.length === 2 && Number(historyCount.rows[0].count) === 0) {
    const columns = await client.execute('PRAGMA table_info(`secret_santa`)');
    if (!columns.rows.some(({ name }) => name === 'mail_status')) {
      await client.execute("ALTER TABLE `secret_santa` ADD `mail_status` text DEFAULT 'pending' NOT NULL");
      await client.execute("UPDATE `secret_santa` SET `mail_status` = 'sent' WHERE `mail_date` <= unixepoch()");
    }

    const journal = JSON.parse(await readFile(new URL('./drizzle/meta/_journal.json', import.meta.url)));
    const entry = journal.entries[0];
    const migration = await readFile(new URL(`./drizzle/${entry.tag}.sql`, import.meta.url), 'utf8');
    const hash = createHash('sha256').update(migration).digest('hex');
    await client.execute('CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (id INTEGER PRIMARY KEY AUTOINCREMENT, hash text NOT NULL, created_at numeric)');
    await client.execute('INSERT INTO `__drizzle_migrations` (hash, created_at) VALUES (?, ?)', [hash, entry.when]);
  }

  await migrate(drizzle(client), { migrationsFolder: new URL('./drizzle', import.meta.url).pathname });
} finally {
  await client.close();
}

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@libsql/client';

const directory = await mkdtemp(join(tmpdir(), 'secret-santa-migrations-'));
const appDir = fileURLToPath(new URL('.', import.meta.url));

try {
  for (const legacy of [false, true]) {
    const url = pathToFileURL(join(directory, `${legacy ? 'legacy' : 'fresh'}.db`)).href;
    let client = createClient({ url });

    if (legacy) {
      await client.execute('CREATE TABLE secret_santa (id text primary key, name text not null, mail_date integer not null, created_at integer)');
      await client.execute('CREATE TABLE user (id text primary key, name text not null, email text not null, secret_santa text not null, forbidden text not null default (json_array()), gift_to text, created_at integer)');
      await client.execute({ sql: 'INSERT INTO secret_santa (id, name, mail_date) VALUES (?, ?, ?)', args: ['keep', 'Existing', 0] });
      await client.execute({ sql: 'INSERT INTO user (id, name, email, secret_santa, forbidden) VALUES (?, ?, ?, ?, ?)', args: ['u1', 'User', 'u@example.com', 'keep', '[]'] });
    }
    await client.close();

    for (let i = 0; i < 2; i++) {
      const result = spawnSync('node', ['migrate.js'], { cwd: appDir, env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr || result.stdout);
    }

    client = createClient({ url });
    const migrations = await client.execute('SELECT count(*) AS count FROM `__drizzle_migrations`');
    assert.equal(Number(migrations.rows[0].count), 1);
    const groups = await client.execute('SELECT count(*) AS count FROM `secret_santa`');
    assert.equal(Number(groups.rows[0].count), Number(legacy));
    if (legacy) {
      const status = await client.execute({ sql: 'SELECT mail_status FROM secret_santa WHERE id = ?', args: ['keep'] });
      assert.equal(status.rows[0].mail_status, 'sent');
      const users = await client.execute('SELECT count(*) AS count FROM `user`');
      assert.equal(Number(users.rows[0].count), 1);
    }
    await client.close();
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}

console.log('Fresh install, legacy upgrade, and repeated startup passed.');

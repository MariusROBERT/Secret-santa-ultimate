import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';

const client = createClient({ url: 'file:data/secretSantaUltimate.sql' });

let db;

export function getDb() {
	if (!db)
		db = drizzle(client, { schema, casing: 'snake_case' });
	return db
}

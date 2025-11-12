import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';

const client = createClient({ url: 'file:secretSantaUltimate.sql' });

export const db = drizzle(client, { schema, casing: 'snake_case' });

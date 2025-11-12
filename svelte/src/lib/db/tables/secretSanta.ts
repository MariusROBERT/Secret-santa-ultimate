import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core';
import { generateCode } from '../../generateCode';

export const secretSanta = sqliteTable('secret_santa', {
  id: text().primaryKey().$defaultFn(generateCode),
  name: text().notNull(),
  mailDate: int({ mode: 'timestamp' }).notNull(),
});

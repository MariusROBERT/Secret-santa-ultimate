import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core';
import { generateCode } from '../../generateCode';
import { relations } from 'drizzle-orm';
import { user } from './user.ts';

export const secretSanta = sqliteTable('secret_santa', {
  id: text().primaryKey().$defaultFn(generateCode),
  name: text().notNull(),
  mailDate: int({ mode: 'timestamp' }).notNull(),
	createdAt: int({ mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const groupsRelations = relations(secretSanta, ({ many }) => ({
  users: many(user),
}));

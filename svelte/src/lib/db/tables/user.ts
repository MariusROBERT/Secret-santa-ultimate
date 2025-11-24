import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { secretSanta } from './secretSanta';

export const user = sqliteTable('user', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  email: text().notNull(),
  secretSanta: text()
    .references((): AnySQLiteColumn => secretSanta.id)
    .notNull(),
  forbidden: text({ mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(
      sql`(json_array()
          )`,
    ),
  giftTo: text().references((): AnySQLiteColumn => user.id),
});

export const usersRelations = relations(user, ({ one }) => ({
  santa: one(secretSanta, {
    fields: [user.secretSanta],
    references: [secretSanta.id],
  }),
}));

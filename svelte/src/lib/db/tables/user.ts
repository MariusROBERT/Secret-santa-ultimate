import { sql } from 'drizzle-orm';
import { sqliteTable, text, int, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { secretSanta } from '../schema';

export const user = sqliteTable('user', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull(),
  secretSanta: int().references((): AnySQLiteColumn => secretSanta.id),
  banList: text({ mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(
      sql`(json_array()
          )`,
    )
    .references((): AnySQLiteColumn => user.id),
  giftTo: int().references((): AnySQLiteColumn => user.id),
});

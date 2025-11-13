import { secretSanta, user } from '$lib/db/schema.js';
import { DATABASE_URL } from '$env/static/private';
import { db } from '$lib/db/index.js';
import { eq } from 'drizzle-orm';

/**
 * @param {string} code
 * @return {Promise<{ id: string, name: string, mailDate: Date, users: any[]} | undefined>}
 */
export async function getSecretSanta(code) {
  let [santa] = await db.select().from(secretSanta).where(eq(secretSanta.id, code));
  if (!santa) return undefined;

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      secretSanta: user.secretSanta,
      forbidden: user.banList,
    })
    .from(user)
    .where(eq(user.secretSanta, code));
  return { users: users, ...santa };
}

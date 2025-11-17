import { db } from '$lib/db/index.js';
import { user } from '$lib/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Add a user to a secretSanta
 * @param userId {string}
 * @param forbiddenList {string[]}
 * @returns {Promise<object>}
 */
export async function addForbidden(userId, forbiddenList) {
  let [updatedUser] = await db
    .update(user)
    .set({ forbidden: forbiddenList })
    .where(eq(user.id, userId))
    .returning({
      id: user.id,
      forbidden: user.forbidden,
      name: user.name,
      email: user.email,
      secretSanta: user.secretSanta,
    });

  return updatedUser;
}

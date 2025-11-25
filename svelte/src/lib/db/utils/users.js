import { db } from '$lib/db/index.js';
import { user } from '$lib/db/schema.js';
import { and, eq, isNull } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

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
    .where(and(eq(user.id, userId), isNull(user.giftTo))) // Already solved secretSanta will set giftTo column
    .returning({
      id: user.id,
      forbidden: user.forbidden,
      name: user.name,
      email: user.email,
      secretSanta: user.secretSanta,
    });
  if (!updatedUser) throw error(404, `User '${userId}' not found`);

  return updatedUser;
}

/**
 * Delete a user from the DB
 * @param userId {string}
 * @returns {Promise<object>}
 */
export async function deleteUser(userId) {
  let [deletedUser] = await db
    .delete(user)
    .where(and(eq(user.id, userId), isNull(user.giftTo)))
    .returning({ id: user.id });

  if (!deletedUser) throw error(404, `User '${userId}' not found.`);

  return deletedUser;
}

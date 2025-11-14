import { db } from '$lib/db/index.js';
import { user } from '$lib/db/schema.js';

/**
 * Add a user to a secretSanta
 * @param santaId {string}
 * @param email {string}
 * @param name {string}
 * @returns {Promise<object>}
 */
export async function addUsers(santaId, email, name) {
  let [newUser] = await db.insert(user).values({ secretSanta: santaId, email, name }).returning();
  return newUser;
}

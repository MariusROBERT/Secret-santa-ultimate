import { secretSanta, user } from '$lib/db/schema.js';
import { db } from '$lib/db/index.js';
import { eq } from 'drizzle-orm';

/**
 * Get secretSanta data from its code/id
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
      forbidden: user.forbidden,
    })
    .from(user)
    .where(eq(user.secretSanta, code));
  return { users: users, ...santa };
}

/**
 * @param {string} name
 * @param {Date} mailDate
 * @return {Promise<{ id: string, name: string, mailDate: Date }>}
 */
export async function createSecretSanta(name, mailDate) {
  const newSanta = {
    name: name,
    mailDate: mailDate,
  };

  let santa;
  for (let i = 0; i < 10; i++) {
    try {
      [santa] = await db.insert(secretSanta).values(newSanta).returning();
      break;
    } catch (e) {
      console.warn(e);
    }
    if (i === 10) throw 'Unable to create secretSanta';
  }
  if (!santa) throw 'Error while creating secretSanta';

  return santa;
}

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

/**
 * Generate a map of <User, User> following the forbidden rules and the 1v1 rule
 * @param secretSanta {{users: {id: string, giftTo: string, forbidden: string[]}[]}}
 * @param iteration {number}
 * @returns
 */
export function solveSecretSanta(secretSanta, iteration = 0) {
  if (iteration > 10000) {
    // If we can't find a solution after 10000 iterations, give up
    return null;
  }
  const remainingGiftees = [...secretSanta.users];
  const secretSantaMap = new Map();

  for (const user of secretSanta.users) {
    const availableGiftees = remainingGiftees.filter(
      (giftee) =>
        giftee.id !== user.id &&
        (!user.forbidden || !user.forbidden.includes(giftee.id)) &&
        secretSantaMap.get(giftee) !== user,
    );

    if (availableGiftees.length === 0) {
      // If there are no suitable giftees, start over
      return solveSecretSanta(secretSanta, iteration + 1);
    }

    const randomIndex = Math.floor(Math.random() * availableGiftees.length);
    const selectedGiftee = availableGiftees[randomIndex];

    secretSantaMap.set(user, selectedGiftee);
    remainingGiftees.splice(remainingGiftees.indexOf(selectedGiftee), 1);
  }

  return secretSantaMap;
}

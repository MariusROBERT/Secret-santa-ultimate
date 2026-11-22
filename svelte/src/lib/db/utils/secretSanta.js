import { secretSanta, user } from '$lib/db/schema.js';
import { getDb } from '$lib/db/index.js';
import { and, eq, gt } from 'drizzle-orm';
import { sendMail } from '$lib/mailer.js';
import { error } from '@sveltejs/kit';

const db = getDb();

/**
 * Get secretSanta data from its code/id
 * @param {string} code
 * @return {Promise<{ id: string, name: string, mailDate: number, users: any[]}>}
 */
export async function getSecretSanta(code) {
  let [santa] = await db.select().from(secretSanta).where(eq(secretSanta.id, code));
  if (!santa) throw error(404, `Secret santa '${code}' not found`);

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
  return { users: users, ...santa, mailDate: Number(santa.mailDate) };
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

/** Thrown when no full assignment satisfies the group's constraints. */
export class UnsatisfiableSecretSantaError extends Error {
  /** @param {{ name: string, id: string }} secretSanta */
  constructor(secretSanta) {
    super(`No valid Secret Santa assignment for ${secretSanta.name} (${secretSanta.id})`);
    this.name = 'UnsatisfiableSecretSantaError';
  }
}

/** @typedef {{ id: string, name: string, email: string, forbidden?: string[] }} SecretSantaUser */

/** @template T @param {T[]} items @returns {T[]} */
function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * @param {SecretSantaUser} giver
 * @param {SecretSantaUser[]} users
 * @param {Map<SecretSantaUser, SecretSantaUser>} assignments
 * @param {Set<string>} recipients
 * @returns {SecretSantaUser[]}
 */
function getAvailableRecipients(giver, users, assignments, recipients) {
  const available = [];
  for (const giftee of users) {
    if (
      recipients.has(giftee.id) ||
      giftee.id === giver.id ||
      giver.forbidden?.includes(giftee.id) ||
      assignments.get(giftee) === giver
    ) {
      continue;
    }
    available.push(giftee);
  }
  return available;
}

/**
 * @param {SecretSantaUser[]} users
 * @param {Map<SecretSantaUser, SecretSantaUser>} assignments
 * @param {Set<string>} recipients
 * @returns {boolean}
 */
function searchAssignment(users, assignments, recipients) {
  if (assignments.size === users.length) return true;

  /** @type {SecretSantaUser | undefined} */
  let mostConstrained;
  /** @type {SecretSantaUser[]} */
  let options = [];

  for (const giver of users) {
    if (assignments.has(giver)) continue;

    const available = getAvailableRecipients(giver, users, assignments, recipients);
    if (available.length === 0) return false;
    if (!mostConstrained || available.length < options.length) {
      mostConstrained = giver;
      options = available;
    }
  }

  if (!mostConstrained) return false;
  for (const giftee of shuffle(options)) {
    assignments.set(mostConstrained, giftee);
    recipients.add(giftee.id);
    if (searchAssignment(users, assignments, recipients)) return true;
    assignments.delete(mostConstrained);
    recipients.delete(giftee.id);
  }
  return false;
}

/**
 * Generate a complete assignment with unique recipients, no self-gifts,
 * forbidden-recipient exclusions, and no reciprocal pairs.
 * @param {{ id: string, name: string, users: SecretSantaUser[] }} secretSanta - Group to assign.
 * @returns {Map<SecretSantaUser, SecretSantaUser>}
 * @throws {UnsatisfiableSecretSantaError} If no valid complete assignment exists.
 */
export function solveSecretSanta(secretSanta) {
  const assignments = new Map();
  const recipients = new Set();
  if (!searchAssignment(secretSanta.users, assignments, recipients))
    throw new UnsatisfiableSecretSantaError(secretSanta);
  return assignments;
}

/**
 * Send mail to every user of the secretSanta
 * @param {{ id: string, name: string, users: SecretSantaUser[] }} secretSanta
 * @returns {void} Returns without side effects when the constraints are unsatisfiable.
 */
export function sendMails(secretSanta) {
  let solution;
  try {
    solution = solveSecretSanta(secretSanta);
  } catch (e) {
    if (e instanceof UnsatisfiableSecretSantaError) {
      console.warn(e);
      return;
    }
    throw e;
  }

  const mailPromises = [];
  const backupPromises = [];
  console.log('start');
  for (const [gifter, giftee] of solution) {
    console.log(gifter.id, '->', giftee.id);
    backupPromises.push(db.update(user).set({ giftTo: giftee.id }).where(eq(user.id, gifter.id)));
    mailPromises.push(sendMail(secretSanta.name, gifter, giftee));
  }
  Promise.all(mailPromises).then(() => console.log('Mails sent for', secretSanta.name));
  Promise.all(backupPromises).then(() => console.log('Backup done for', secretSanta.name));
  Promise.all([...mailPromises, ...backupPromises]).then(() =>
    console.log('All done for', secretSanta.name, secretSanta.id),
  );
}

/**
 * Update secret santa room data
 * @param id {string}
 * @param newData {{mailDate: number | undefined, name: string | undefined}}
 * @return Promise<object>
 */
export async function updateSecretSanta(id, newData) {
  let filteredData = {};

  if (newData.mailDate && new Date(newData.mailDate) > new Date())
    filteredData.mailDate = new Date(newData.mailDate);
  if (newData.name && newData.name.trim().length > 0) filteredData.name = newData.name;

  if (Object.keys(filteredData).length === 0) throw error(422, 'Invalid new data');

  const now = new Date();
  let [updatedSanta] = await db
    .update(secretSanta)
    .set(filteredData)
    .where(and(eq(secretSanta.id, id), gt(secretSanta.mailDate, now)))
    .returning();

  if (!updatedSanta) throw error(404, `Secret santa '${id}' not found`);

  return { ...updatedSanta, mailDate: Number(updatedSanta.mailDate) };
}

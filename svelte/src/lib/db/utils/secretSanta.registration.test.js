import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('DATABASE_URL', `file:/tmp/secret-santa-registration-${process.pid}.db`);
vi.mock('$lib/mailer.js', () => ({ sendMail: vi.fn() }));

const { getDb } = await import('$lib/db/index.js');
const { secretSanta, user } = await import('$lib/db/schema.js');
const { addUsers, sendMails } = await import('./secretSanta.js');
const { eq, sql } = await import('drizzle-orm');
const db = getDb();

beforeAll(async () => {
  await db.run(sql`CREATE TABLE secret_santa (
    id text PRIMARY KEY NOT NULL, name text NOT NULL, mail_date integer NOT NULL,
    mail_status text DEFAULT 'pending' NOT NULL, mail_started_at integer, created_at integer
  )`);
  await db.run(sql`CREATE TABLE user (
    id text PRIMARY KEY NOT NULL, name text NOT NULL, email text NOT NULL,
    secret_santa text NOT NULL, forbidden text DEFAULT (json_array()) NOT NULL,
    gift_to text, mail_sent_at integer, created_at integer,
    FOREIGN KEY (secret_santa) REFERENCES secret_santa(id),
    FOREIGN KEY (gift_to) REFERENCES user(id)
  )`);
});

beforeEach(async () => {
  await db.delete(user);
  await db.delete(secretSanta);
});

async function createEvent(mailDate = new Date(Date.now() + 60_000), mailStatus = 'pending') {
  const [event] = await db.insert(secretSanta).values({
    id: crypto.randomUUID(), name: 'Test event', mailDate, mailStatus,
  }).returning();
  return event;
}

describe('participant registration', () => {
  it('allows registration before the scheduled drawing', async () => {
    const event = await createEvent();

    const participant = await addUsers(event.id, 'one@example.com', 'One');

    expect(participant).toMatchObject({ secretSanta: event.id, email: 'one@example.com', name: 'One' });
  });

  it('rejects registration after the scheduled drawing without inserting a participant', async () => {
    const event = await createEvent(new Date(Date.now() - 60_000));

    await expect(addUsers(event.id, 'one@example.com', 'One')).rejects.toMatchObject({ status: 409 });
    expect(await db.select().from(user)).toHaveLength(0);
  });

  it('rejects registration after assignments have been generated', async () => {
    const event = await createEvent(new Date(Date.now() - 60_000));
    for (const [index, name] of ['One', 'Two', 'Three'].entries()) {
      await db.insert(user).values({
        id: `participant-${index}`, secretSanta: event.id, email: `${name}@example.com`, name,
      });
    }
    await sendMails({ ...event, mailStatus: 'pending', users: [] });

    await expect(addUsers(event.id, 'late@example.com', 'Late')).rejects.toMatchObject({ status: 409 });
    expect(await db.select().from(user)).toHaveLength(3);
    expect((await db.select().from(user)).every(({ giftTo }) => giftTo)).toBe(true);
  });

  it('returns 404 when the event does not exist', async () => {
    await expect(addUsers('missing', 'one@example.com', 'One')).rejects.toMatchObject({ status: 404 });
    expect(await db.select().from(user)).toHaveLength(0);
  });

  it('does not insert a participant while drawing executes concurrently', async () => {
    const event = await createEvent(new Date(Date.now() - 60_000));
    for (const [index, name] of ['One', 'Two', 'Three'].entries()) {
      await db.insert(user).values({
        id: `concurrent-${index}`, secretSanta: event.id, email: `${name}@example.com`, name,
      });
    }

    const [registration] = await Promise.allSettled([
      addUsers(event.id, 'late@example.com', 'Late'),
      sendMails({ ...event, mailStatus: 'pending', users: [] }),
    ]);

    expect(registration.status).toBe('rejected');
    expect(await db.select().from(user)).toHaveLength(3);
    const [updatedEvent] = await db.select().from(secretSanta).where(eq(secretSanta.id, event.id));
    expect(updatedEvent.mailStatus).toBe('sent');
  });
});

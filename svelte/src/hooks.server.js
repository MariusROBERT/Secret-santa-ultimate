import { scheduleJob } from 'node-schedule';
import { getDb } from '@/db/index.js';
import { secretSanta } from '@/db/schema.js';
import { and, eq, lte, or } from 'drizzle-orm';
import { MAIL_LEASE_MS, MAIL_RETRY_DELAY_MS, sendMails } from '@/db/utils/secretSanta.js';

const db = getDb();

scheduleJob('*/5 * * * *', async () => {
  const now = new Date();
  const leaseExpiredAt = new Date(now.getTime() - MAIL_LEASE_MS);
  const retryAfter = new Date(now.getTime() - MAIL_RETRY_DELAY_MS);

  const dueSecretSantas = await db.query.secretSanta.findMany({
    where: and(
      lte(secretSanta.mailDate, now),
      or(
        eq(secretSanta.mailStatus, 'pending'),
        and(eq(secretSanta.mailStatus, 'failed'), lte(secretSanta.mailStartedAt, retryAfter)),
        and(
          eq(secretSanta.mailStatus, 'sending'),
          lte(secretSanta.mailStartedAt, leaseExpiredAt),
        ),
      ),
    ),
  });

  for (const secretSanta of dueSecretSantas) {
    await sendMails(secretSanta);
    console.log('Job started for', secretSanta.name, secretSanta.id);
  }
});

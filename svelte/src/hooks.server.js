import { scheduleJob } from 'node-schedule';
import { getDb } from '@/db/index.js';
import { secretSanta } from '@/db/schema.js';
import { and, eq, lte } from 'drizzle-orm';
import { sendMails } from '@/db/utils/secretSanta.js';

const db = getDb()

scheduleJob('*/5 * * * *', async () => {
  const dueSecretSantas = await db.query.secretSanta.findMany({
    with: {
      users: true,
    },
    where: and(lte(secretSanta.mailDate, new Date()), eq(secretSanta.mailStatus, 'pending')),
  });

  for (const secretSanta of dueSecretSantas) {
    await sendMails(secretSanta);
    console.log('Job started for', secretSanta.name, secretSanta.id);
  }
});

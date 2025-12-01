import { scheduleJob } from 'node-schedule';
import { db } from '@/db/index.js';
import { gt, lt } from 'drizzle-orm';
import { sendMails } from '@/db/utils/secretSanta.js';

// Everyday at 8AM
scheduleJob('0 8 * * *', async () => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const tomorrow = new Date(Number(today) + 24 * 3_600 * 1_000);

  const todaySecretSanta = await db.query.secretSanta.findMany({
    with: {
      users: true,
    },
    where: (santa, { and }) => and(gt(santa.mailDate, today), lt(santa.mailDate, tomorrow)),
  });

  console.log(JSON.stringify(todaySecretSanta));

  for (const secretSanta of todaySecretSanta) {
    sendMails(secretSanta);
    console.log('Job started for', secretSanta.name, secretSanta.id);
  }
});

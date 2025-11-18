import schedule from 'node-schedule';
import { user } from '$lib/db/schema.js';
import { db } from '$lib/db/index.js';
import { eq, gt, lt } from 'drizzle-orm';
import { sendMails } from '$lib/db/utils/secretSanta.js';

// Everyday at 8AM
const job = schedule.scheduleJob('0 8 * * *', async () => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const tomorrow = new Date(Number(today) + 24 * 3_600 * 1_000);

  const todaySecretSanta = await db.query.secretSanta.findMany({
    where: (santa, { and }) =>
      and(eq(santa.id, user.secretSanta), gt(santa.mailDate, today), lt(santa.mailDate, tomorrow)),
    with: {
      user: true,
    },
  });

  console.log(todaySecretSanta);

  for (const secretSanta of todaySecretSanta) sendMails(secretSanta);
  console.log('Job started');
});

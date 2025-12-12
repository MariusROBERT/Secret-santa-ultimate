import { error, json } from '@sveltejs/kit';
import { addUsers } from '$lib/db/utils/secretSanta.js';
import { z } from 'zod';

/**@typedef {import('@sveltejs/kit').RequestEvent} RequestEvent*/

/**
 * Add a user to a secret santa
 * @param _ {RequestEvent}
 */
export async function POST({ request, params }) {
  const { name, mail } = await request.json();
  const { code } = params;
  if (!name || !mail || !code) throw error(422, { message: 'missing fields' });

  const newUserSchema = z.object({
    name: z.string().min(1),
    mail: z.email(),
  });

  try {
    newUserSchema.parse({ name: name, mail: mail });
  } catch (e) {
    throw error(422, { message: JSON.parse(e.message)[0].message });
  }

  const user = await addUsers(code, mail, name);

  return json(user);
}

import { error, json } from '@sveltejs/kit';
import { createSecretSanta } from '$lib/db/utils/secretSanta.js';

/**@typedef {import('@sveltejs/kit').RequestEvent} RequestEvent*/

/**
 * Create a new secret santa room
 * @param _ {RequestEvent}
 * @constructor
 */
export async function POST({ request }) {
  const { name, date } = await request.json();
  if (!name || !date) throw error(422, { message: 'missing fields' });

  const santa = await createSecretSanta(name, new Date(date));

  return json({ code: santa.id });
}

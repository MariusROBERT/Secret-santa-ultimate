import { error, json } from '@sveltejs/kit';
import { getSecretSanta } from '$lib/db/utils/secretSanta.js';

/**@typedef {import('@sveltejs/kit').RequestEvent} RequestEvent*/

/**
 * Retrieve secret santa room data
 * @param _ {RequestEvent}
 */
export async function GET({ params }) {
  const { code } = params;
  if (!code) throw error(404, { message: 'invalid url' });

  const santa = await getSecretSanta(code);
  if (!santa) throw error(404, { message: 'Secret santa not found' });

  return json(santa);
}

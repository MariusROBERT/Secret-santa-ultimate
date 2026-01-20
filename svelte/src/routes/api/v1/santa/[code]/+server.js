import { error, json } from '@sveltejs/kit';
import { getSecretSanta, updateSecretSanta } from '$lib/db/utils/secretSanta.js';

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

/**
 * Update secret santa room data
 * @param _ {RequestEvent}
 */
export async function PATCH({ request, params }) {
  const { code } = params;
  if (!code) throw error(404, { message: 'invalid url' });
  const body = await request.json();
  if (!body) throw error(422, { message: 'invalid parameters' });

  const santa = await updateSecretSanta(code, body);

  return json(santa);
}

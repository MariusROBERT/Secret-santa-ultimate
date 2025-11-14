import { error, json } from '@sveltejs/kit';
import { addUsers } from './addUsers.js';

/**@typedef {import('@sveltejs/kit').RequestEvent} RequestEvent*/

/**
 * Add a user to a secret santa
 * @param _ {RequestEvent}
 */
export async function POST({ request, params }) {
  const { name, mail } = await request.json();
  const { code } = params;
  if (!name || !mail || !code) throw error(422, { message: 'missing fields' });

  const user = await addUsers(code, mail, name);

  return json(user);
}

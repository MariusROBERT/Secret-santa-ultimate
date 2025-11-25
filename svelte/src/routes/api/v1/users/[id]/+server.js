import { error, json } from '@sveltejs/kit';
import { addForbidden, deleteUser } from '$lib/db/utils/users.js';

/**@typedef {import('@sveltejs/kit').RequestEvent} RequestEvent*/

/**
 * Add forbidden users to a user
 * @param _ {RequestEvent}
 */
export async function PATCH({ request, params }) {
  const { forbidden } = await request.json();
  const { id } = params;
  if (!forbidden || !id) throw error(422, { message: 'missing fields' });

  const user = await addForbidden(id, forbidden);

  return json(user);
}

/**
 * Delete user
 * @param _ {RequestEvent}
 */
export async function DELETE({ params }) {
  const { id } = params;
  if (!id) throw error(422, { message: 'missing fields' });

  const user = await deleteUser(id);

  return json(user);
}

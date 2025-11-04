import { redirect } from '@sveltejs/kit';

export function load({url} : {url: URL}) {
  redirect(303, `/${url.searchParams.get('code')}`)
}

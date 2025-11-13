export async function load({ params, fetch }) {
  return await fetch(`/api/v1/santa/${params.code}`).then(
    (/** @type {{ json: () => any; }} */ res) => res.json(),
  );
}

import {json} from "@sveltejs/kit";

/**
 * Healthcheck
 */
export async function GET() {
  return json({ healthy: true });
}

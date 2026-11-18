import { getMatches } from '../../../lib/discover.js';
import { store } from '../../../lib/store.js';
import { json, handleError } from '../../../lib/http.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /matches — mutual matches only, newest first.
export async function GET() {
  try {
    const matches = await store.read((db) => getMatches(db));
    return json({ matches });
  } catch (err) {
    return handleError(err);
  }
}

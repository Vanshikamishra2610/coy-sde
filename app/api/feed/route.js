import { getFeed } from '../../../lib/discover.js';
import { store } from '../../../lib/store.js';
import { json, handleError } from '../../../lib/http.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /feed — profiles the logged-in user has not swiped on yet.
export async function GET() {
  try {
    const profiles = await store.read((db) => getFeed(db));
    return json({ profiles });
  } catch (err) {
    return handleError(err);
  }
}

import { recordSwipe, DiscoverError } from '../../../lib/discover.js';
import { store } from '../../../lib/store.js';
import { json, handleError } from '../../../lib/http.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /swipe  { profileId: string, action: "like" | "pass" }
// -> { match: false } | { match: true, profile, matchedAt, sharedInterests }
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new DiscoverError(400, 'invalid_json', 'Request body must be JSON.');
    }
    const result = await store.transact((db) => recordSwipe(db, body));
    return json(result);
  } catch (err) {
    return handleError(err);
  }
}

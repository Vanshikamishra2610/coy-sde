import { store } from '../../../lib/store.js';
import { json, handleError } from '../../../lib/http.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/reset — demo helper: wipe swipes/matches and re-seed. Disabled in production.
export async function POST() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_RESET !== '1') {
    return json({ error: { code: 'forbidden', message: 'Reset is disabled.' } }, 403);
  }
  try {
    await store.reset();
    return json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}

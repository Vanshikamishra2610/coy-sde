// Pure domain logic for the Discover feature. Every function takes the db object
// so it can be unit-tested without touching disk or HTTP.
//
// Privacy rule (the core promise of Coy): nothing returned from here may reveal
// that someone liked the user unless the like is mutual. Concretely:
//   - feed profiles never carry any "likes you" signal, and feed order does not depend on it;
//   - a like with no mutual like and a pass return the exact same response shape;
//   - matches only exist when BOTH sides have liked.

import { ME } from './seed.js';

export { ME };

export const ACTIONS = Object.freeze(['like', 'pass']);

const PUBLIC_FIELDS = ['id', 'name', 'age', 'photo', 'bio', 'city', 'college', 'interests'];

export class DiscoverError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Strip a stored profile down to the fields that are safe to send to the client. */
export function toPublicProfile(profile) {
  const out = {};
  for (const key of PUBLIC_FIELDS) out[key] = profile[key];
  return out;
}

function findSwipe(db, from, to) {
  return db.swipes.find((s) => s.from === from && s.to === to);
}

// The logged-in user lives in db.me; everyone else in db.profiles.
function findProfile(db, id) {
  if (db.me && id === db.me.id) return { interests: [], ...db.me };
  return db.profiles.find((p) => p.id === id);
}

function sharedInterests(db, userId, profile) {
  const mine = userId === db.me?.id ? db.me.interests ?? [] : findProfile(db, userId)?.interests ?? [];
  const set = new Set(mine.map((i) => i.toLowerCase()));
  return profile.interests.filter((i) => set.has(i.toLowerCase()));
}

/** GET /feed — profiles the user has not swiped on yet (in a stable order). */
export function getFeed(db, userId = ME) {
  const swiped = new Set(db.swipes.filter((s) => s.from === userId).map((s) => s.to));
  return db.profiles.filter((p) => p.id !== userId && !swiped.has(p.id)).map(toPublicProfile);
}

/**
 * POST /swipe — record a like or pass. Mutates db.
 * Returns { match: false } or { match: true, profile, matchedAt, sharedInterests }.
 */
export function recordSwipe(db, input, userId = ME, now = new Date()) {
  const profileId = input?.profileId;
  const action = input?.action;

  if (typeof profileId !== 'string' || !profileId) {
    throw new DiscoverError(400, 'invalid_profile_id', '`profileId` must be a non-empty string.');
  }
  if (!ACTIONS.includes(action)) {
    throw new DiscoverError(400, 'invalid_action', '`action` must be "like" or "pass".');
  }
  if (profileId === userId) {
    throw new DiscoverError(400, 'self_swipe', 'You cannot swipe on yourself.');
  }
  const profile = findProfile(db, profileId);
  if (!profile) {
    throw new DiscoverError(404, 'profile_not_found', 'No such profile.');
  }
  if (findSwipe(db, userId, profileId)) {
    // A profile that has been swiped on must never be swiped (or shown) again.
    throw new DiscoverError(409, 'already_swiped', 'You have already swiped on this profile.');
  }

  const at = now.toISOString();
  db.swipes.push({ from: userId, to: profileId, action, at });

  if (action !== 'like') return { match: false };

  const theirs = findSwipe(db, profileId, userId);
  if (!theirs || theirs.action !== 'like') return { match: false };

  const match = { id: `m_${userId}_${profileId}`, users: [userId, profileId], at };
  db.matches.push(match);

  return {
    match: true,
    profile: toPublicProfile(profile),
    matchedAt: at,
    sharedInterests: sharedInterests(db, userId, profile),
  };
}

/** GET /matches — the user's mutual matches, newest first. */
export function getMatches(db, userId = ME) {
  return db.matches
    .filter((m) => m.users.includes(userId))
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((m) => {
      const otherId = m.users.find((u) => u !== userId);
      const profile = findProfile(db, otherId);
      if (!profile) return null;
      return {
        profile: toPublicProfile(profile),
        matchedAt: m.at,
        sharedInterests: sharedInterests(db, userId, profile),
      };
    })
    .filter(Boolean);
}

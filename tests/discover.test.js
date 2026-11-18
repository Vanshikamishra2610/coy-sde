import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createSeedDb, ME } from '../lib/seed.js';
import { getFeed, recordSwipe, getMatches, DiscoverError } from '../lib/discover.js';

function likerAndNonLiker(db) {
  const likers = new Set(db.swipes.filter((s) => s.to === ME && s.action === 'like').map((s) => s.from));
  const liker = db.profiles.find((p) => likers.has(p.id));
  const nonLiker = db.profiles.find((p) => !likers.has(p.id));
  return { liker, nonLiker, likers };
}

describe('seed data', () => {
  test('has at least 30 complete profiles', () => {
    const db = createSeedDb();
    assert.ok(db.profiles.length >= 30);
    for (const p of db.profiles) {
      for (const key of ['id', 'name', 'age', 'photo', 'bio', 'city', 'college', 'interests']) {
        assert.ok(p[key] !== undefined && p[key] !== '', `${p.id} missing ${key}`);
      }
      assert.ok(Array.isArray(p.interests) && p.interests.length > 0);
    }
    assert.equal(new Set(db.profiles.map((p) => p.id)).size, db.profiles.length, 'ids are unique');
  });

  test('some profiles already like the user', () => {
    const { likers } = likerAndNonLiker(createSeedDb());
    assert.ok(likers.size >= 3);
  });
});

describe('getFeed', () => {
  test('returns every profile before any swipes', () => {
    const db = createSeedDb();
    assert.equal(getFeed(db).length, db.profiles.length);
  });

  test('never includes a profile the user already swiped on (like or pass)', () => {
    const db = createSeedDb();
    const [a, b] = db.profiles;
    recordSwipe(db, { profileId: a.id, action: 'like' });
    recordSwipe(db, { profileId: b.id, action: 'pass' });
    const ids = getFeed(db).map((p) => p.id);
    assert.ok(!ids.includes(a.id));
    assert.ok(!ids.includes(b.id));
    assert.equal(ids.length, db.profiles.length - 2);
  });

  test('swipes made by OTHER users do not hide profiles from my feed', () => {
    const db = createSeedDb();
    // Seeded likes are from other profiles to me; those profiles must still appear.
    const { liker } = likerAndNonLiker(db);
    assert.ok(getFeed(db).some((p) => p.id === liker.id));
  });

  test('exposes only public fields — no hint about who liked the user', () => {
    const db = createSeedDb();
    const { liker, nonLiker } = likerAndNonLiker(db);
    const feed = getFeed(db);
    const a = feed.find((p) => p.id === liker.id);
    const b = feed.find((p) => p.id === nonLiker.id);
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
    assert.deepEqual(Object.keys(a).sort(), ['age', 'bio', 'city', 'college', 'id', 'interests', 'name', 'photo']);
  });

  test('returns an empty list once everyone has been swiped', () => {
    const db = createSeedDb();
    for (const p of db.profiles) recordSwipe(db, { profileId: p.id, action: 'pass' });
    assert.deepEqual(getFeed(db), []);
  });
});

describe('recordSwipe', () => {
  test('liking someone who liked me creates a match', () => {
    const db = createSeedDb();
    const { liker } = likerAndNonLiker(db);
    const res = recordSwipe(db, { profileId: liker.id, action: 'like' });
    assert.equal(res.match, true);
    assert.equal(res.profile.id, liker.id);
    assert.ok(res.matchedAt);
    assert.equal(db.matches.length, 1);
  });

  test('liking someone who has not liked me is not a match', () => {
    const db = createSeedDb();
    const { nonLiker } = likerAndNonLiker(db);
    assert.deepEqual(recordSwipe(db, { profileId: nonLiker.id, action: 'like' }), { match: false });
    assert.equal(db.matches.length, 0);
  });

  test('passing on someone who liked me is not a match and reveals nothing', () => {
    const db = createSeedDb();
    const { liker, nonLiker } = likerAndNonLiker(db);
    const passLiker = recordSwipe(db, { profileId: liker.id, action: 'pass' });
    const likeNonLiker = recordSwipe(db, { profileId: nonLiker.id, action: 'like' });
    // Indistinguishable responses: the client can't learn who liked them.
    assert.deepEqual(passLiker, { match: false });
    assert.deepEqual(likeNonLiker, passLiker);
    assert.equal(db.matches.length, 0);
  });

  test('a later mutual like by the other user completes the match', () => {
    const db = createSeedDb();
    const { nonLiker } = likerAndNonLiker(db);
    recordSwipe(db, { profileId: nonLiker.id, action: 'like' });
    const res = recordSwipe(db, { profileId: ME, action: 'like' }, nonLiker.id);
    assert.equal(res.match, true);
    assert.equal(getMatches(db).length, 1);
    assert.equal(getMatches(db)[0].profile.id, nonLiker.id);
  });

  test('rejects swiping the same profile twice', () => {
    const db = createSeedDb();
    const id = db.profiles[0].id;
    recordSwipe(db, { profileId: id, action: 'pass' });
    assert.throws(
      () => recordSwipe(db, { profileId: id, action: 'like' }),
      (err) => err instanceof DiscoverError && err.status === 409,
    );
    assert.equal(db.swipes.filter((s) => s.from === ME && s.to === id).length, 1);
  });

  test('validates input', () => {
    const db = createSeedDb();
    const id = db.profiles[0].id;
    const cases = [
      [{ profileId: id, action: 'superlike' }, 400],
      [{ profileId: id }, 400],
      [{ action: 'like' }, 400],
      [{ profileId: 42, action: 'like' }, 400],
      [null, 400],
      [{ profileId: 'nope', action: 'like' }, 404],
      [{ profileId: ME, action: 'like' }, 400],
    ];
    for (const [input, status] of cases) {
      assert.throws(
        () => recordSwipe(db, input),
        (err) => err instanceof DiscoverError && err.status === status,
        JSON.stringify(input),
      );
    }
    assert.equal(db.swipes.filter((s) => s.from === ME).length, 0, 'invalid swipes are not recorded');
  });
});

describe('getMatches', () => {
  test('lists only mutual matches, newest first, with public fields only', () => {
    const db = createSeedDb();
    const { likers, nonLiker } = likerAndNonLiker(db);
    const [l1, l2, l3] = [...likers];
    recordSwipe(db, { profileId: l1, action: 'like' }, ME, new Date('2026-02-01T00:00:00Z'));
    recordSwipe(db, { profileId: l2, action: 'like' }, ME, new Date('2026-03-01T00:00:00Z'));
    recordSwipe(db, { profileId: l3, action: 'pass' });
    recordSwipe(db, { profileId: nonLiker.id, action: 'like' });

    const matches = getMatches(db);
    assert.deepEqual(matches.map((m) => m.profile.id), [l2, l1]);
    for (const m of matches) assert.ok(!('likesMe' in m.profile));
  });

  test('is empty when nobody matched', () => {
    assert.deepEqual(getMatches(createSeedDb()), []);
  });
});

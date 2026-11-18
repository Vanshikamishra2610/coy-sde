import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createStore } from '../lib/store.js';
import { getFeed, recordSwipe, getMatches } from '../lib/discover.js';
import { ME } from '../lib/seed.js';

async function tempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'coy-'));
  return { dir, file: path.join(dir, 'db.json') };
}

test('seeds the file on first read', async () => {
  const { file } = await tempStore();
  const store = createStore(file);
  const feed = await store.read((db) => getFeed(db));
  assert.ok(feed.length >= 30);
  await fs.access(file);
});

test('swipes and matches persist across store instances (i.e. reloads/restarts)', async () => {
  const { file } = await tempStore();
  const first = createStore(file);
  const liker = await first.read((db) => db.swipes.find((s) => s.to === ME && s.action === 'like').from);
  const res = await first.transact((db) => recordSwipe(db, { profileId: liker, action: 'like' }));
  assert.equal(res.match, true);

  const second = createStore(file);
  assert.ok(!(await second.read((db) => getFeed(db))).some((p) => p.id === liker));
  assert.equal((await second.read((db) => getMatches(db)))[0].profile.id, liker);
});

test('a failed transaction writes nothing', async () => {
  const { file } = await tempStore();
  const store = createStore(file);
  await store.read(() => {});
  const before = await fs.readFile(file, 'utf8');
  await assert.rejects(store.transact((db) => recordSwipe(db, { profileId: 'nope', action: 'like' })));
  assert.equal(await fs.readFile(file, 'utf8'), before);
});

test('concurrent duplicate swipes are serialised: exactly one succeeds', async () => {
  const { file } = await tempStore();
  const store = createStore(file);
  const id = await store.read((db) => db.profiles[0].id);
  const results = await Promise.allSettled(
    Array.from({ length: 5 }, () => store.transact((db) => recordSwipe(db, { profileId: id, action: 'like' }))),
  );
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.ok(results.filter((r) => r.status === 'rejected').every((r) => r.reason.status === 409));
  const count = await store.read((db) => db.swipes.filter((s) => s.from === ME && s.to === id).length);
  assert.equal(count, 1);
});

test('reset restores the seed', async () => {
  const { file } = await tempStore();
  const store = createStore(file);
  const id = await store.read((db) => db.profiles[0].id);
  await store.transact((db) => recordSwipe(db, { profileId: id, action: 'pass' }));
  await store.reset();
  assert.ok((await store.read((db) => getFeed(db))).some((p) => p.id === id));
});

// Tiny JSON-file persistence layer.
// - Lazily seeds the file on first read.
// - Serialises every read/write through a promise queue so concurrent requests
//   can't interleave a read-modify-write (e.g. double-tapping "like").
// - Writes atomically (temp file + rename) so a crash never leaves half a JSON file.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createSeedDb } from './seed.js';

export function createStore(filePath) {
  let queue = Promise.resolve();

  async function save(db) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8');
    await fs.rename(tmp, filePath);
  }

  async function load() {
    try {
      return JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      const db = createSeedDb();
      await save(db);
      return db;
    }
  }

  function enqueue(task) {
    const run = queue.then(task);
    queue = run.catch(() => {}); // keep the queue alive after a failed task
    return run;
  }

  return {
    filePath,
    /** Run fn(db) with a read-only view; nothing is written. */
    read: (fn) => enqueue(async () => fn(await load())),
    /** Run fn(db), then persist. If fn throws, nothing is written. */
    transact: (fn) =>
      enqueue(async () => {
        const db = await load();
        const result = await fn(db);
        await save(db);
        return result;
      }),
    reset: () => enqueue(() => save(createSeedDb())),
  };
}

const DB_PATH = process.env.COY_DB_PATH || path.join(process.cwd(), 'data', 'db.json');

// Reuse one store across Next.js hot reloads so the queue is truly shared.
const g = globalThis;
export const store = g.__coyStore ?? (g.__coyStore = createStore(DB_PATH));

# coy · Discover

A swipe-based **Discover** tab for Coy, built as a standalone mobile-first app: a bottom tab bar with a blank **Home** tab and a fully working **Discover** tab (swipe, match, matches list), backed by a small Node API with JSON-file persistence.

> Coy's promise: *you only ever find out if it's mutual.* That rule drives the whole design — see [Privacy guarantees](#privacy-guarantees).

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # backend unit tests (node:test, no extra deps)
```

The database file `data/db.json` is created and seeded on first request. To start the demo over, use **Reset demo** on the empty state, `POST /api/reset`, or `npm run reset-db`.

**Demo tip:** 10 of the 32 seeded profiles have already liked you (e.g. *Aanya*, *Rohan*, *Saanvi*), so liking them triggers the "It's a match!" screen.

## Features

| Area | What's there |
|---|---|
| Swipe | One card at a time with a peek of the next two. Drag on mobile and desktop (distance **or** flick velocity), ❌ / ♥ buttons, and keyboard shortcuts (← / → or P / L) |
| Feedback | The card tilts as you drag, a pink LIKE or dark NOPE stamp and tint appear, the card flies out, and a toast confirms the swipe ("they'll only know if it's mutual") |
| Matching | Full-screen "It's a match!" with both photos, floating hearts and shared interests. A Matches view shows a grid of mutual matches; tap one to open a profile sheet |
| States | Skeleton loading, error state with retry, an "all caught up" empty state, and an empty Matches state |
| Resilience | Swipes are optimistic. If a request fails, the card comes back; a 409 (already swiped) is ignored |
| Persistence | Swipes and matches are stored server-side, so they survive reloads and server restarts |

## API

All endpoints work at both the paths from the brief and under `/api/*` (they are the same handlers).

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/feed` | – | `{ profiles: Profile[] }`: profiles you have not swiped on |
| POST | `/swipe` | `{ profileId, action: "like" \| "pass" }` | `{ match: false }` or `{ match: true, profile, matchedAt, sharedInterests }` |
| GET | `/matches` | – | `{ matches: { profile, matchedAt, sharedInterests }[] }`, newest first |
| POST | `/api/reset` | – | Re-seeds the demo (disabled in production unless `ALLOW_RESET=1`) |

Errors return `{ error: { code, message } }`: `400` for invalid input or JSON, `404` for an unknown profile, `409` for an already-swiped profile.

`Profile = { id, name, age, photo, bio, city, college, interests[] }`

## Architecture

```
app/
  page.js               tab shell (Home | Discover)
  api/{feed,swipe,matches,reset}/route.js   thin HTTP handlers
components/             Discover, SwipeCard (framer-motion), MatchModal, MatchesList, TabBar
lib/
  discover.js           pure domain logic: getFeed / recordSwipe / getMatches
  store.js              JSON-file store: lazy seed, serialised transactions, atomic writes
  seed.js               32 mock profiles; 10 pre-like the user
tests/                  node:test suites for the logic and the store
```

* **Data model.** Swipes are stored the same way for everyone: `{ from, to, action, at }`. Seeded "they liked you" data is just swipes *from* other profiles *to* `me`. A match is created when the second like lands, and it records both user ids. The logic therefore works for any pair of users, not only the logged-in one.
* **Logic is pure.** `lib/discover.js` takes a db object and has no I/O, so the tests run in milliseconds and the route handlers stay a few lines long.
* **Store.** Every read-modify-write runs through a promise queue, so a double-tapped like can't create two swipes. Writes go to a temp file and then `rename`, so a crash can't leave a half-written JSON file. If a transaction throws, nothing is written.

## Privacy guarantees

1. **Nothing in the feed hints that someone liked you.** The feed returns a fixed whitelist of public fields (tested). The order is the seed order, not "people who liked you first".
2. **Responses can't be told apart.** A like without a match returns exactly `{ match: false }`, the same as a pass. Nothing in the response reveals that the other person liked you (tested).
3. **Matches require both likes.** If someone liked you and you passed, no match is ever created or shown (tested).
4. **No re-swiping.** Once you swipe on a profile it never comes back in the feed, and the API rejects a second swipe with `409`. So you can't swipe someone again to find out whether they liked you.

## Tests

`npm test` runs 20 tests covering:

* seed shape
* feed filtering and the field whitelist
* match and no-match cases
* identical responses for a pass and a like without a match
* a later mutual like completing a match
* rejection of duplicate and invalid swipes
* match ordering
* persistence across store instances
* no writes when a transaction fails
* concurrent duplicate swipes (exactly one succeeds)
* reset

---

## Part A: Two features I'd add to Coy

> *Based on getcoy.com and its privacy policy and terms (updated 16 Nov 2026). Check these points against your own walkthrough of the app before you submit.*

### Context: how Coy works today
* You log in with your phone number and add crushes by **phone number or email**.
* A match happens only when **both people add each other using an identifier the other person has registered**.
* The first 3 crushes are free. Extra slots cost ₹49 to ₹199. Adding is final, removing someone locks that slot for 30 days, and unmatched entries are deleted after 180 days.
* Someone who isn't on Coy gets at most 3 anonymous heads-ups.

Coy's privacy model is strong. Two things limit how many matches it can produce: whether you can identify your crush in the first place, and whether they are on Coy at all.

### 1. Add a crush by Instagram handle, and link more than one identifier to an account
**What**
* Let users add a crush by **Instagram username**, alongside phone and email.
* Let each account verify **several identifiers**: more than one phone number, more than one email, and an Instagram handle (verified through Instagram login or a one-time code sent by DM).
* Matching runs across all of a person's verified identifiers.

**Why**
* **You often don't have their number.** For many people, especially at college, a crush is someone they follow on Instagram, not someone whose number they have. Today they can't add that person at all, and asking around for the number defeats the point of being anonymous.
* **Matches are missed silently.** If you add your crush's personal number and they signed up with a different number or email, you never match, even though the feeling is mutual. Neither of you ever learns this happened, so the paid slot is wasted. That is a failure users can't detect and is likely to hurt trust.
* **Privacy stays the same.** Instagram handles can be stored as keyed hashes, just like phone numbers and emails are today. Each identifier still has to be verified, so nobody can claim another person's handle.

### 2. Campus "Reveal Night": every match on a campus revealed at the same moment
**What**
* Run time-limited drops for a college or city, for example "IIT Bombay Reveal Night, Friday 9 pm".
* During the week before, students join and add crushes as usual. Matches made during that window stay hidden until the reveal time, then everyone finds out together.
* The campus ambassador and invite programs Coy already has would promote it.
* Coy could show **aggregate numbers only**, such as "1,240 students from your college have joined". It would never show counts for an individual.

**Why**
* **A match needs both people on Coy.** Today the only way a crush finds out about the app is up to 3 anonymous heads-ups that they may ignore. Coy grows only as fast as people trickle in.
* **A shared deadline gives a reason to join now.** It concentrates sign-ups on one campus in one week, so the crush is far more likely to be on Coy too. This works the same way college fests and Valentine's events create a burst of activity.
* **Revealing everything at once protects privacy.** A match that appears seconds after you add someone tells you they had already added you. Revealing every match at the same time removes that timing clue.
* **It's a natural moment to buy extra slots.** People are more willing to buy extra slots when they have a deadline, which suits Coy's one-time slot pricing.

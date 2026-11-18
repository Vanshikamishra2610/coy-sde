'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SwipeCard from './SwipeCard.js';
import MatchModal from './MatchModal.js';
import MatchesList from './MatchesList.js';
import Logo from './Logo.js';
import { HeartIcon, XIcon, LockIcon } from './Icons.js';

const VISIBLE = 3;

async function api(path, options) {
  const res = await fetch(path, { cache: 'no-store', ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export default function Discover() {
  const [view, setView] = useState('discover'); // 'discover' | 'matches'
  const [feed, setFeed] = useState(null); // null = loading
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState(null);
  const [exitDir, setExitDir] = useState(1);
  const [match, setMatch] = useState(null);
  const [toast, setToast] = useState(null);
  const [unseen, setUnseen] = useState(0);
  const feedRef = useRef(null);
  const lockRef = useRef(false);
  const toastTimer = useRef(null);
  feedRef.current = feed;

  const showToast = useCallback((text, tone = 'neutral') => {
    clearTimeout(toastTimer.current);
    setToast({ text, tone, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [f, m] = await Promise.all([api('/api/feed'), api('/api/matches')]);
      setFeed(f.profiles);
      setMatches(m.matches);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const swipe = useCallback(
    async (action) => {
      const current = feedRef.current;
      if (!current?.length || lockRef.current) return;
      lockRef.current = true;
      setTimeout(() => (lockRef.current = false), 260);

      const top = current[0];
      setExitDir(action === 'like' ? 1 : -1);
      setFeed(current.slice(1)); // optimistic

      if (action === 'like') showToast(`Liked ${top.name} — they'll only know if it's mutual`, 'like');
      else showToast(`Passed on ${top.name}`, 'pass');

      try {
        const res = await api('/api/swipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: top.id, action }),
        });
        if (res.match) {
          const entry = { profile: res.profile, matchedAt: res.matchedAt, sharedInterests: res.sharedInterests };
          setMatches((m) => [entry, ...(m ?? []).filter((x) => x.profile.id !== res.profile.id)]);
          setUnseen((n) => n + 1);
          setToast(null);
          setMatch(entry);
        }
      } catch (e) {
        if (e.status === 409) return; // already swiped elsewhere — it should stay gone
        // Network/server failure: put the card back so nothing is silently lost.
        setFeed((f) => [top, ...(f ?? []).filter((p) => p.id !== top.id)]);
        showToast("Couldn't save that swipe. Try again.", 'error');
      }
    },
    [showToast],
  );

  // Desktop keyboard shortcuts.
  useEffect(() => {
    if (view !== 'discover' || match) return;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'l') swipe('like');
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') swipe('pass');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [swipe, view, match]);

  const resetDemo = async () => {
    try {
      await api('/api/reset', { method: 'POST' });
      setFeed(null);
      setMatches(null);
      setUnseen(0);
      await load();
      setView('discover');
      showToast('Demo reset — everyone is back');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const openMatches = () => {
    setMatch(null);
    setUnseen(0);
    setView('matches');
  };

  const visible = feed?.slice(0, VISIBLE) ?? [];
  const empty = feed && feed.length === 0;

  return (
    <section className="discover" aria-label="Discover">
      <header className="topbar">
        <Logo />
        <div className="segmented" role="tablist" aria-label="Discover views">
          <button role="tab" aria-selected={view === 'discover'} onClick={() => setView('discover')}>
            Discover
          </button>
          <button role="tab" aria-selected={view === 'matches'} onClick={openMatches}>
            Matches
            {matches?.length > 0 && <span className={`badge ${unseen ? 'new' : ''}`}>{matches.length}</span>}
          </button>
          <motion.span
            className="segmented-pill"
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            style={{ left: view === 'discover' ? 4 : '50%' }}
          />
        </div>
      </header>

      {error ? (
        <div className="empty">
          <h3>Can&apos;t reach Coy</h3>
          <p>{error}</p>
          <button className="btn btn-small" onClick={load}>
            Try again
          </button>
        </div>
      ) : view === 'matches' ? (
        <div className="matches-wrap">
          <MatchesList matches={matches ?? []} loading={!matches} onDiscover={() => setView('discover')} />
        </div>
      ) : (
        <>
          <p className="privacy-note">
            <LockIcon /> Likes are secret. You only find out if it&apos;s mutual.
          </p>

          <div className="deck">
            {feed === null && <div className="card skeleton" />}

            <AnimatePresence custom={exitDir}>
              {visible
                .map((p, i) => <SwipeCard key={p.id} profile={p} depth={i} onSwipe={swipe} />)
                .reverse()}
            </AnimatePresence>

            {empty && (
              <motion.div className="empty in-deck" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
                <span className="sticker">All caught up ✌️</span>
                <div className="empty-art">
                  <span>🌙</span>
                </div>
                <h3>That&apos;s everyone for now</h3>
                <p>
                  You&apos;ve seen everyone for now. New people show up as they join — check back soon.
                </p>
                <button className="btn btn-small" onClick={openMatches}>
                  See your matches{matches?.length ? ` (${matches.length})` : ''}
                </button>
                <button className="btn link" onClick={resetDemo}>
                  Reset demo
                </button>
              </motion.div>
            )}
          </div>

          <div className="actions" aria-hidden={empty || undefined}>
            <button className="action pass" aria-label="Pass" disabled={!feed?.length} onClick={() => swipe('pass')}>
              <XIcon />
            </button>
            <span className="remaining">{feed ? `${feed.length} left` : ''}</span>
            <button className="action like" aria-label="Like" disabled={!feed?.length} onClick={() => swipe('like')}>
              <HeartIcon />
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={`toast ${toast.tone}`}
            role="status"
            initial={{ opacity: 0, y: -12, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -12, x: '-50%' }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {match && <MatchModal match={match} onClose={() => setMatch(null)} onViewMatches={openMatches} />}
      </AnimatePresence>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Photo from './Photo.js';
import { HeartIcon, LockIcon, PinIcon, CapIcon, XIcon } from './Icons.js';
import { toneFor } from './tone.js';

function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function MatchesList({ matches, loading, onDiscover }) {
  const [open, setOpen] = useState(null);

  if (loading) {
    return (
      <div className="matches-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="match-tile skeleton" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="empty">
        <div className="empty-art">
          <HeartIcon width={40} height={40} />
        </div>
        <h3>No matches yet</h3>
        <p>When someone you liked likes you back, they&apos;ll show up here. Until then, nobody knows a thing.</p>
        <button className="btn btn-small" onClick={onDiscover}>
          Start swiping
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="privacy-note">
        <LockIcon /> Only mutual likes show up here
      </p>
      <motion.ul className="matches-grid" layout>
        {matches.map(({ profile, matchedAt }, i) => (
          <motion.li
            key={profile.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.04 }}
          >
            <button className={`match-tile tone-${toneFor(profile.id)}`} onClick={() => setOpen(matches[i])}>
              <Photo src={profile.photo} name={profile.name} />
              <span className="match-tile-info">
                <strong>
                  {profile.name}, {profile.age}
                </strong>
                <small>Matched {timeAgo(matchedAt)}</small>
              </span>
            </button>
          </motion.li>
        ))}
      </motion.ul>

      <AnimatePresence>
        {open && (
          <motion.div
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              className="sheet"
              role="dialog"
              aria-modal="true"
              aria-label={`${open.profile.name}'s profile`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="sheet-close" aria-label="Close" onClick={() => setOpen(null)}>
                <XIcon width={18} height={18} />
              </button>
              <Photo src={open.profile.photo} name={open.profile.name} className="sheet-photo" />
              <div className="sheet-body">
                <h3>
                  {open.profile.name}, {open.profile.age}
                </h3>
                <p className="meta dark">
                  <span><CapIcon /> {open.profile.college}</span>
                  <span><PinIcon /> {open.profile.city}</span>
                </p>
                <p>{open.profile.bio}</p>
                <ul className="chips dark">
                  {open.profile.interests.map((t) => (
                    <li key={t} className={open.sharedInterests?.includes(t) ? 'shared' : ''}>
                      {t}
                    </li>
                  ))}
                </ul>
                {open.sharedInterests?.length > 0 && (
                  <p className="muted">Highlighted interests are ones you share.</p>
                )}
                <p className="match-badge">
                  <HeartIcon width={16} height={16} /> You liked each other · {timeAgo(open.matchedAt)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

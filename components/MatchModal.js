'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Photo from './Photo.js';
import { HeartIcon } from './Icons.js';

const HEARTS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 53) % 100,
  delay: (i % 6) * 0.4,
  size: 14 + ((i * 7) % 20),
  duration: 3.2 + (i % 4) * 0.6,
  color: ['var(--pink)', 'var(--yellow)', 'var(--lilac)', 'var(--mint)'][i % 4],
}));

export default function MatchModal({ match, onClose, onViewMatches }) {
  const { profile, sharedInterests = [] } = match;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className="match-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="floating-hearts" aria-hidden="true">
        {HEARTS.map((h, i) => (
          <span
            key={i}
            style={{
              left: `${h.left}%`,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.duration}s`,
              fontSize: h.size,
              color: h.color,
            }}
          >
            ♥
          </span>
        ))}
      </div>

      <motion.span
        className="sticker"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.25 }}
      >
        ✨ It&apos;s mutual
      </motion.span>

      <motion.div
        className="match-card"
        initial={{ scale: 0.6, rotate: -8, y: 30 }}
        animate={{ scale: 1, rotate: 2.5, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      >
        <div className="pair">
          <motion.div className="avatar avatar-you" initial={{ x: -40 }} animate={{ x: 0 }}>
            You
          </motion.div>
          <motion.div
            className="pair-heart"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.35, 1] }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <HeartIcon width={22} height={22} />
          </motion.div>
          <motion.div className="avatar avatar-them" initial={{ x: 40 }} animate={{ x: 0 }}>
            <Photo src={profile.photo} name={profile.name} />
          </motion.div>
        </div>
        <h2 id="match-title" className="match-title">
          It&apos;s a match!
        </h2>
        <p className="match-text">
          You and <strong>{profile.name}</strong> liked each other. Nobody else will ever know.
        </p>
        {sharedInterests.length > 0 && (
          <p className="match-shared">You both like {sharedInterests.join(' · ')}</p>
        )}
      </motion.div>

      <div className="match-actions">
        <button className="btn" onClick={onViewMatches} autoFocus>
          See your matches
        </button>
        <button className="btn btn-dark" onClick={onClose}>
          Keep swiping
        </button>
      </div>
    </motion.div>
  );
}

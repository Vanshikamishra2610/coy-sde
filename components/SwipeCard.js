'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Photo from './Photo.js';
import { InfoIcon, PinIcon, CapIcon } from './Icons.js';
import { toneFor } from './tone.js';

const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 550;

const variants = {
  stacked: (depth) => ({
    scale: 1 - depth * 0.04,
    y: depth * 12,
    // Cards underneath peek out slightly tilted, like a messy stack of stickers.
    rotateZ: depth === 0 ? 0 : depth % 2 ? 2.5 : -2.5, // separate from the drag `rotate` motion value
    opacity: depth > 2 ? 0 : 1,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  }),
  // `dir` comes from AnimatePresence's `custom`, so the exit direction is known
  // even though this card's own props are stale once it's removed.
  exit: (dir) => ({
    x: dir * 640,
    y: 40,
    rotate: dir * 28,
    opacity: 0,
    transition: { duration: 0.38, ease: [0.22, 0.61, 0.36, 1] },
  }),
};

export default function SwipeCard({ profile, depth, onSwipe }) {
  const isTop = depth === 0;
  const [expanded, setExpanded] = useState(false);
  const x = useMotionValue(0);
  const dragRotate = useTransform(x, [-320, 0, 320], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [24, SWIPE_DISTANCE], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_DISTANCE, -24], [1, 0]);
  const likeScale = useTransform(x, [24, SWIPE_DISTANCE], [0.6, 1]);
  const nopeScale = useTransform(x, [-SWIPE_DISTANCE, -24], [1, 0.6]);

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) onSwipe('like');
    else if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) onSwipe('pass');
  };

  return (
    <motion.article
      className={`card tone-${toneFor(profile.id)} ${isTop ? 'top' : ''}`}
      style={{ x, rotate: dragRotate, zIndex: 10 - depth }}
      custom={depth}
      variants={variants}
      initial={{ scale: 0.85, y: 50, opacity: 0 }}
      animate="stacked"
      exit="exit"
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      dragTransition={{ bounceStiffness: 320, bounceDamping: 22 }}
      onDragEnd={handleDragEnd}
      aria-hidden={!isTop}
      aria-label={`${profile.name}, ${profile.age}`}
    >
      <div className="card-photo-wrap">
        <Photo src={profile.photo} name={profile.name} className="card-photo" />
        <span className="card-city">
          <PinIcon /> {profile.city}
        </span>
        <motion.div className="stamp like" style={{ opacity: likeOpacity, scale: likeScale }}>
          LIKE ♥
        </motion.div>
        <motion.div className="stamp nope" style={{ opacity: nopeOpacity, scale: nopeScale }}>
          NOPE
        </motion.div>
      </div>

      <div className={`card-info ${expanded ? 'expanded' : ''}`}>
        <div className="card-title">
          <h2>
            {profile.name}<span>, {profile.age}</span>
          </h2>
          {isTop && (
            <button
              className="info-btn"
              aria-label={expanded ? 'Show less' : 'Show more'}
              aria-expanded={expanded}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setExpanded((v) => !v)}
            >
              <InfoIcon />
            </button>
          )}
        </div>
        <p className="meta">
          <CapIcon /> {profile.college}
        </p>
        <p className="bio">{profile.bio}</p>
        <ul className="chips">
          {profile.interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

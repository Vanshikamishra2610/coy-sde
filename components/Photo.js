'use client';

import { useState } from 'react';

// <img> with a graceful gradient + initial fallback when the placeholder host is unreachable.
export default function Photo({ src, name, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div className={`photo-fallback ${className}`} aria-label={name}>
        {name?.[0] ?? '?'}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className={className}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

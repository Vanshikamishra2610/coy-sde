'use client';

import { useEffect, useState } from 'react';
import TabBar from '../components/TabBar.js';
import Discover from '../components/Discover.js';
import Logo from '../components/Logo.js';

const TAB_KEY = 'coy.tab';

export default function Page() {
  const [tab, setTab] = useState('discover');

  // Remember the last tab across reloads (a per-device convenience only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TAB_KEY);
      if (saved === 'home' || saved === 'discover') setTab(saved);
    } catch {}
  }, []);

  const changeTab = (t) => {
    setTab(t);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {}
  };

  return (
    <div className="stage">
      <aside className="side-copy" aria-hidden="true">
        <Logo size={48} />
        <span className="sticker">New · Discover tab</span>
        <h1>
          Swipe. Like. <mark>Only find out</mark> if it&apos;s mutual.
        </h1>
        <p className="lede">One-sided likes stay secret forever. Nobody sees who liked them — unless they liked you too.</p>
        <ol className="mini-steps">
          <li className="tone-lilac"><b>1</b> Swipe right to like, left to pass</li>
          <li className="tone-peach"><b>2</b> They never know — unless they like you</li>
          <li className="tone-pink"><b>3</b> Both like? It&apos;s a match</li>
        </ol>
        <p className="keys">
          <kbd>←</kbd> pass <kbd>→</kbd> like
        </p>
      </aside>

      <main className="phone">
        <div className="screen">
          {tab === 'home' ? (
            // Intentionally blank per the brief: Coy's existing Home experience would live here.
            <section className="home" aria-label="Home">
              <Logo size={36} />
              <p>Home</p>
              <small>Coy&apos;s existing experience lives here.</small>
              <button className="btn btn-small" onClick={() => changeTab('discover')}>
                Go to Discover
              </button>
            </section>
          ) : (
            <Discover />
          )}
        </div>
        <TabBar tab={tab} onChange={changeTab} />
      </main>
    </div>
  );
}

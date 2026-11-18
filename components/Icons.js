const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const HomeIcon = (p) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...p}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
);

export const CardsIcon = (p) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...p}>
    <rect x="6" y="3" width="12" height="17" rx="2.5" transform="rotate(8 12 11.5)" />
    <path d="M12 9.2c-.9-1.4-3.4-1-3.4.9 0 1.6 2.1 2.9 3.4 3.9 1.3-1 3.4-2.3 3.4-3.9 0-1.9-2.5-2.3-3.4-.9z" transform="rotate(8 12 11.5)" fill="currentColor" stroke="none" />
  </svg>
);

export const HeartIcon = (p) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" {...p}>
    <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.5.8-1.3 2.3-2.5 4.4-2.5 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z" />
  </svg>
);

export const XIcon = (p) => (
  <svg viewBox="0 0 24 24" width="28" height="28" {...base} strokeWidth={3} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const InfoIcon = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.5v.01" />
  </svg>
);

export const PinIcon = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...base} {...p}>
    <path d="M12 21s-6-5.3-6-11a6 6 0 1 1 12 0c0 5.7-6 11-6 11z" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
);

export const CapIcon = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...base} {...p}>
    <path d="M2 9l10-5 10 5-10 5z" />
    <path d="M6 11v5c0 1.2 2.7 3 6 3s6-1.8 6-3v-5" />
  </svg>
);

export const LockIcon = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...base} {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const BackIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

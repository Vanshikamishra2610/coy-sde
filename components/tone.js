// Stable pastel per profile, in the getcoy.com palette.
const TONES = ['lilac', 'peach', 'mint', 'sky', 'pink'];

export function toneFor(id = '') {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Expose the APIs at the exact paths from the brief (GET /feed, POST /swipe, GET /matches)
  // in addition to the conventional /api/* paths.
  async rewrites() {
    return [
      { source: '/feed', destination: '/api/feed' },
      { source: '/swipe', destination: '/api/swipe' },
      { source: '/matches', destination: '/api/matches' },
    ];
  },
};

export default nextConfig;

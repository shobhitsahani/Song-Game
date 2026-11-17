import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  output: process.env.NEXT_STANDALONE === '1' ? 'standalone' : undefined,
  transpilePackages: ['@song-game/types', '@song-game/shared', '@song-game/socket'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  devIndicators: false,
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  async redirects() {
    return [
      {
        source: '/github',
        destination: 'https://github.com/shobhitsahani/Song-Game',
        permanent: false,
      },
      {
        source: '/repo',
        destination: 'https://github.com/shobhitsahani/Song-Game',
        permanent: false,
      },
      {
        source: '/source',
        destination: 'https://github.com/shobhitsahani/Song-Game',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

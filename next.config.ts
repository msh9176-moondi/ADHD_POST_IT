import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ['openai'],
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig

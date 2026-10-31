/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  async redirects() {
    return [
      { source: '/works', destination: '/#work', permanent: true },
      { source: '/works/:slug*', destination: '/#work', permanent: true }
    ]
  }
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    useTypeScriptCli: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oss.kinda.info',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

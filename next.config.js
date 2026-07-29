/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    useTypeScriptCli: true,
  },
  // the portrait was renamed with the July → Kinda cleanup; the old path was in
  // the Person JSON-LD, so keep it reachable
  async redirects() {
    return [
      {
        source: '/images/july-portrait.jpg',
        destination: '/images/kinda-portrait.jpg',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oss.kinda.info',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'alnda-public.oss-cn-hangzhou.aliyuncs.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'qingyon-revornix-public.oss-cn-beijing.aliyuncs.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

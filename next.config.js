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
      {
        protocol: 'https',
        hostname: 'alnda-public.oss-cn-hangzhou.aliyuncs.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

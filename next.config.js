/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, swcMinify: true, images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'oss.kinda.info',
                port: '',
                pathname: '/image/**',
            },
            {
                protocol: 'https',
                hostname: 'oss.kinda.info',
                port: '',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig;
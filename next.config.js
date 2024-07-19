/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
    output: 'export',
    sassOptions: {
        includePaths: [path.join(__dirname, 'components')],
    },
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
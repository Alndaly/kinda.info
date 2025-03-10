/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
    sassOptions: {
        includePaths: [path.join(__dirname, 'components')],
    },
    images: {
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
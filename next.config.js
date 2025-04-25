/** @type {import('next').NextConfig} */
const path = require('path')

const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
    process.env.VELITE_STARTED = '1'
    import('velite').then(m => m.build({ watch: isDev, clean: !isDev }))
}

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
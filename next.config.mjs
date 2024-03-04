/** @type {import('next').NextConfig} */
import TerserPlugin from 'terser-webpack-plugin'

const nextConfig = {
  // 以下だとURL routingされる
  // i18n: {
  //   locales: ['en-US', 'ja'],
  //   defaultLocale: 'en-US',
  // },
  webpack: (config, options) => {
    config.optimization.minimize = true
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true },
        },
        extractComments: 'all',
      }),
    ]
    return config
  },
}

export default nextConfig
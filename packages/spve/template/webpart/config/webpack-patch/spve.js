const webpack = require('webpack')
const serve = require('../serve.json')
const spve = require('../spve.json')
const path = require('path')

module.exports = function applySpveWebpackPatch(webpackConfig) {
  if (spve.host) {
    webpackConfig.resolve ||= {}
    webpackConfig.resolve.alias ||= {}
    webpackConfig.resolve.alias['spve/host$'] = path.resolve(
      __dirname,
      '../../lib/webparts/spve/SpveWebPartBase.js',
    )
  }
  const isDevelopment = process.env.SPVE_PRODUCTION !== '1'
  const protocol = serve.https ? 'https' : 'http'
  const host = serve.ipAddress || 'localhost'

  for (const plugin of webpackConfig.plugins || []) {
    const processor = plugin?._options?.cumulativeManifestProcessor
    if (processor?._options) {
      processor._options.baseUrl = `${protocol}://${host}:${serve.port}`
    }
  }

  if (isDevelopment) {
    webpackConfig.devServer ||= {}
    webpackConfig.devServer.proxy ||= []
    webpackConfig.devServer.proxy.push({
      context: ['/__spve', '/__spve-hmr'],
      target: `https://localhost:${process.env.SPVE_VITE_PORT}`,
      changeOrigin: true,
      secure: false,
      ws: true,
    })
  }

  webpackConfig.plugins ||= []
  webpackConfig.plugins.push(
    new webpack.DefinePlugin({
      __SPVE_DEV__: JSON.stringify(isDevelopment),
    }),
  )
  return webpackConfig
}

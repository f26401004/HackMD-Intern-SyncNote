const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const ChromeExtensionReloader = require('webpack-extension-reloader')

const SRC_DIR = path.resolve(__dirname, 'src')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new ChromeExtensionReloader({
      reloadPage: true,
      manifest: path.join(SRC_DIR, 'manifest.json')
    })
  ]
})
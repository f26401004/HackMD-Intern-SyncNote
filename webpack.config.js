const path = require('path')
const webpack = require('webpack')
const ChromeExtensionReloader = require('webpack-extension-reloader')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const DIST_DIR = path.resolve(__dirname, 'dist')
const SRC_DIR = path.resolve(__dirname, 'src')

module.exports = {
  entry: {
    background: [path.join(SRC_DIR, 'background.ts')],
    content: [path.join(SRC_DIR, 'content.ts')],
    popup: [path.join(SRC_DIR, 'popup.ts')]
  },
  output: {
    path: DIST_DIR,
    filename: '[name].js',
    publicPath: './',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      vue: 'vue/dist/vue.esm.js'
    }
  },
  module: {
    rules: [
      { test: /.tsx?$/, loader: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new ChromeExtensionReloader({
      reloadPage: true,
      manifest: path.join(SRC_DIR, 'manifest.json')
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CopyWebpackPlugin([
      { from: path.join(SRC_DIR, 'manifest.json') },
      { from: path.join(SRC_DIR, 'icons/'), to: './icons' },
      { from: path.join(SRC_DIR, 'popup.html') }
    ])
  ]
}
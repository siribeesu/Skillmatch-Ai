const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    popup: './src/popup/index.js',
    content: './src/content/index.js',
    background: './src/background/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/popup/index.html', to: 'popup.html' },
        { from: 'src/popup/styles.css', to: 'styles.css' },
        { from: 'src/icons', to: 'icons', noErrorOnMissing: true },
        { from: 'node_modules/pdfjs-dist/build/pdf.worker.min.js', to: 'pdf.worker.min.js' }
      ],
    }),
  ],
  resolve: {
    extensions: ['.js'],
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false,
      "stream": false,
      "util": false,
      "buffer": false,
      "zlib": false
    }
  },
  // Use 'cheap-source-map' or 'inline-source-map' for Chrome Extensions development
  devtool: 'cheap-module-source-map',
};

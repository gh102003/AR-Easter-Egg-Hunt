const path = require('path');

module.exports = {
  mode: "development",
  entry: './src/index.js',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    hot: false,
    https: {
      pfx: "C:\\Users\\georg\\Documents\\Programming\\cert.pfx",
      passphrase: "kilt-leggings-dispatch",
      requestCert: false
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
};
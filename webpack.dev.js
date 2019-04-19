const path = require("path");
const webpack = require("webpack");
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    port: 3000,
    publicPath: "http://0.0.0.0:3000/dist/",
    hotOnly: true,
    host: '0.0.0.0',
    disableHostCheck: true,
    historyApiFallback: {
      index: 'index.html'
    },
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },
  devtool: 'eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      DIRECTORY_BASENAME: JSON.stringify('/'),
      LOGGING_LEVEL: JSON.stringify('info'),
      API_ROOT: JSON.stringify('http://localhost:5000'),
      PROPAGATION_DATE: JSON.stringify('0 */20 * * * *'),
      PROPAGATION_DURATION_MN: 19,
    })
  ]
});

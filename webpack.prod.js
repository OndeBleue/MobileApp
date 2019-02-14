const webpack = require("webpack");
const merge = require('webpack-merge');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const CompressionPlugin = require('compression-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimizer: [
      new MinifyPlugin(),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new CompressionPlugin({
      test: /\.js$|\.css$/,
      filename: '[path].gz[query]'
    }),
    new webpack.DefinePlugin({
      DIRECTORY_BASENAME: JSON.stringify('/app'),
      LOGGING_LEVEL: JSON.stringify('error'),
      API_ROOT: JSON.stringify('https://api.onde-bleue.fr'),
    }),
  ]
});

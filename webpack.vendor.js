const path = require('path');
const webpack = require("webpack");
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  context: process.cwd(),
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png)$/,
        loader: "file-loader"
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css'],
    modules: [__dirname, 'node_modules']
  },
  entry: {
    various: [
      'axios',
      'geolib',
      'lodash',
      'fecha',
    ],
    react: [
      'prop-types',
      'react',
      'react-alert',
      'react-alert-template-basic',
      'react-confirm-alert',
      'react-dom',
      'react-hot-loader',
      'react-router-dom',
      'react-transition-group',
    ],
    leaflet: [
      'leaflet',
      'react-leaflet',
    ],
    fonts: [
      'typeface-alegreya',
      'typeface-news-cycle',
    ]
  },
  output: {
    filename: '[name].dll.js',
    path: path.resolve(__dirname, './vendors'),
    library: '[name]'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new webpack.DllPlugin({
      context: __dirname,
      name: '[name]_[hash]',
      path: path.join(__dirname, './vendors/manifest.json'),
    }),
    new CleanWebpackPlugin([path.join(__dirname, './vendors')]),
  ]
};

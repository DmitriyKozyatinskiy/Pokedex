const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config.js');
const devServer = new WebpackDevServer(
  webpack(config),
  {
    contentBase: __dirname,
    publicPath: '/builds/',
  }
).listen(8088, 'localhost');

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const autoprefixer = require('autoprefixer');
const node_dir = __dirname + '/node_modules';

plugins = [
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
  }),
  new webpack.ProvidePlugin({
    'window.Tether': 'tether',
  }),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    mangle: true,
    compress: {
      warnings: false,
    }
  }),
  new ExtractTextPlugin('bundle.css', { allChunks: true })
];

module.exports = {
  entry: [
    'tether',
    'bootstrap-loader',
    './src/index',
  ],

  output: {
    path: path.join(__dirname, 'builds'),
    filename: 'bundle.js',
  },

  resolve: {
    extensions: ['', '.js'],
    alias: {
      'jquery.sticky': node_dir + '/jquery-sticky/jquery.sticky.js',
    }
  },

  plugins: plugins,

  module: {
    // preLoaders: [
    //     {
    //         test: /\.js/,
    //         loader: 'eslint-loader',
    //         exclude: /node_modules/
    //     }
    // ],
    loaders: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015'],
        }
      },
      {test: /\.html/, loader: 'html'},
      {test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css!postcss')},
      {test: /\.scss$/, loaders: ['style', 'css', 'postcss', 'sass']},
      {test: /\.json$/, loaders: ['json']},
      {test: /bootstrap\/dist\/js\/umd\//, loader: 'imports?jQuery=jquery'},
      {test: /\.(woff2?|svg)$/, loader: 'url?limit=10000'},
      {test: /\.(ttf|eot)$/, loader: 'file'},
    ]
  },

  postcss: [autoprefixer]
};

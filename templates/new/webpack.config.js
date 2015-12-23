var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

/*
  Paths
*/
var appPath = path.resolve(__dirname, 'app');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'build');

/*
  set environment variables for the UI
*/
var configEnv = require('./config').UI;
for (var key in configEnv) {
  configEnv[key] = JSON.stringify(configEnv[key]);
}
var envGlobalVars = new webpack.DefinePlugin(configEnv);

/*
  Create a vendors.js file with the most used libraries, like webpack module
  loader, react, flux.
  Libraries are supposed to not change as frequently as the app code,
  so we can leverage browser cache by splitting these files
  in a separate build.
*/
var vendorsPlugin = new webpack.optimize.CommonsChunkPlugin('vendors', 'js/vendors.js');

/*
  Webpack Configurations
*/
var config = {
  // where to look for files
  context: __dirname,

  entry: {
    app: path.resolve(appPath, 'app.js'),
    vendors: ['react'],
  },

  output: {
    path: buildPath,

    // publicPath is used by webpack-dev-server. The bundle output will be placed in that folder
    publicPath: '/',

    // the app is the key of the entry object
    filename: 'js/[name].js',
  },

  // any request for the root in the devServer will be redirected to the public folder
  devServer: {
    contentBase: 'public',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: [nodeModulesPath],
        loader: 'babel',
        query: {
          // https://github.com/babel/babel-loader#options
          cacheDirectory: true,
          presets: ['es2015', 'react'],
        },
      },
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]',
      },
      {
        test: /\.scss$/,
        exclude: [nodeModulesPath],

        // create a build is a separate file
        loader: ExtractTextPlugin.extract('css!autoprefixer!sass'),
      },
      {
        test: /\.(png|jpg|jpeg|svg|ttf|eot|woff|woff2)$/,
        loader: 'url?limit=8192',
      },
      {
        test: /\.json$/,
        exclude: [nodeModulesPath],
        loader: 'json',
      },
    ],
  },

  plugins: [
    vendorsPlugin,
    envGlobalVars,
    new ExtractTextPlugin('css/[name].css'),
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch',
    }),
  ],
};

module.exports = config;

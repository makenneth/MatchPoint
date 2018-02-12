var path = require("path");
    webpack = require("webpack");

module.exports = {
  context: __dirname,
  entry: "./src/app.js",
  output: {
    publicPath: "/js/",
    path: path.join(__dirname, "public", "js"),
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel']
      },
      { test: /\.json$/, loader: 'json-loader' },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass'],
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
      },
      {
        test: /\.ttf$/,
        loader: 'url',
        query: {
          limit: '10000',
          mimetype: 'application/octet-stream'
        }
      }
    ]
  },
  resolve: {
    modulesDirectories: [
      'src',
      'node_modules',
    ],
    mainFiles: ['index'],
    extensions: ['', '.js', '.jsx'],
    alias: {
      assets: path.join(__dirname, 'src', 'assets'),
    }
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      mangle: false,
      sourceMap: false
    }),
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"),
    new webpack.DefinePlugin({
      "process.env": {
        "NODE_ENV": JSON.stringify("production"),
      }
    })
  ]
};

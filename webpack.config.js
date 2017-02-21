var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval-source-map',
  context: __dirname,
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:5000',
    path.join(__dirname, 'src', 'app.js')
  ],
  output: {
    path: path.join(__dirname, 'public'),
    publicPath: 'http://localhost:5000/',
    filename: 'bundle.js'
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    colors: true,
    stats: 'errors-only',
    contentBase: './public',
    port: 5000
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel', 'eslint']
      },
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
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development'),
        'DEVTOOLS': false
      }
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};
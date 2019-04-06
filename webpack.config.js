require('dotenv').config();

const path = require('path');
const os = require('os');
const portfinder = require('portfinder');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const extractCSS = new ExtractTextPlugin('css/[name].css?[hash:8]');

// 取得本機的所有IP
let HOSTs = ['localhost', '127.0.0.1'];
let ifaces = os.networkInterfaces();
Object.keys(ifaces).forEach(function(ifname) {
  ifaces[ifname].forEach(function(iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }
    HOSTs.push(iface.address);
  });
});
const HOST = '0.0.0.0';
const PORT = '8080';

console.log(process.env.DB_HOST);
console.log(process.env.NODE_ENV);

webpackConfig = {
  mode: process.env.NODE_ENV,
  context: path.resolve(__dirname, 'src'),
  entry: {
    index: './js/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js?[hash:8]'
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor',
          chunks: 'initial',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.(sass|scss)$/,
        use: extractCSS.extract([
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]),
        include: path.resolve('src/scss'),
        exclude: path.resolve('./node_modules')
      },
      {
        test: /\.(js)$/,
        use: 'babel-loader',
        include: path.resolve('.')
      },
      {
        test: /\.(pug)$/,
        use: ['html-loader', 'pug-html-loader'],
        include: path.resolve('src/pug'),
        exclude: path.resolve('./node_modules')
      }
    ]
  },
  plugins: [
    extractCSS,
    new CopyWebpackPlugin([{ from: 'assets', to: 'assets' }]),
    new ImageminPlugin({
      disable: process.env.NODE_ENV !== 'production',
      pngquant: {
        quality: '95-100'
      }
    }),
    new HtmlWebpackPlugin({
      base: '/',
      title: 'Title Demo',
      filename: 'index.html',
      template: './html/index.html',
      chunks: ['vendor', 'index'],
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      }
    })
  ],
  devServer: {
    compress: true,
    port: PORT,
    host: HOST,
    clientLogLevel: 'warning',
    overlay: { warnings: false, errors: true },
    quiet: true,
    stats: {
      assets: true,
      cached: false,
      chunkModules: false,
      chunkOrigins: false,
      chunks: false,
      colors: true,
      hash: false,
      modules: false,
      reasons: false,
      source: false,
      version: false,
      warnings: false
    }
  }
};

module.exports =
  process.env.NODE_ENV === 'development'
    ? new Promise((resolve, reject) => {
        portfinder.basePort = PORT;
        portfinder.getPort((err, port) => {
          if (err) {
            reject(err);
          } else {
            process.env.PORT = port;
            webpackConfig.devServer.port = port;

            webpackConfig.plugins.push(
              new FriendlyErrorsPlugin({
                compilationSuccessInfo: {
                  messages: ['Your application is running here:'].concat(
                    HOSTs.map(HOST => {
                      return `http://${HOST}:${port}`;
                    })
                  )
                },
                onErrors: () => {}
              })
            );

            resolve(webpackConfig);
          }
        });
      })
    : webpackConfig;

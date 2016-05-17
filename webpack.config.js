import path from 'path';

const isProd = (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'prod'
);

export default {
  context: __dirname,
  entry: {
    'app': './src/app'
    //  Add additional entry points here
    //    e.g.  vendor.js
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: '/\.js$/',
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: !isProd,
          presets: [
            'es2015'
          ]
        }
      }
    ]
  },
  devServer: {
    contentBase: __dirname
  }
};

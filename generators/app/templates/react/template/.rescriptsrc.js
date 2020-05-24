// Override webpack configurations
// check it: https://github.com/harrysolovay/rescripts
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { appendWebpackPlugin } = require('@rescripts/utilities');
const __DEV__ = process.env.NODE_ENV !== 'production';

module.exports = [
  [
    'use-babel-config', {
      presets: ['react-app'],
      plugins: [
        'react-refresh/babel',
      ],
    },
  ],
  config => {
    let newConfig = config;

    if (__DEV__) {
      newConfig = appendWebpackPlugin(
        new ReactRefreshPlugin(),
        newConfig,
      )
    }
    return newConfig;
  }
]

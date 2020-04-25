// eslint config
module.exports = {
    root: true,
    env: {
      node: true,
      es6: true,
      es2017: true,
      es2020: true,
    },
    rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'no-extra-semi': 'error',
        'comma-dangle': ['error', 'always-multiline'],
        'indent': ['error', 2],
        'no-inline-comments': 'error',
        'no-cond-assign': 'error',
    },
  }

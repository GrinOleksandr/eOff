// eslint.config.js
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const promise = require('eslint-plugin-promise');
const prettier = require('eslint-plugin-prettier');

module.exports = {
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    globals: {
      amd: 'readonly',
      node: 'readonly',
    },
  },
  plugins: {
    'simple-import-sort': simpleImportSort,
    promise: promise,
    prettier: prettier,
  },
  rules: {
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'],
          ['^@aws-cdk/core$', '^@aws-cdk/.*$', '^@?\\w'],
          ['^(lib|config|lambda)(/.*|$)'],
          ['^(domain)(/.*|$)'],
          ['^\\.'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
        imports: 'always-multiline',
        objects: 'always-multiline',
      },
    ],
  },
};

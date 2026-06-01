const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'warn',
    },
  },
  {
    files: ['babel.config.js', 'jest.config.js'],
    languageOptions: {
      globals: { module: 'writable', require: 'readonly' },
    },
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      globals: { module: 'writable', require: 'readonly', __dirname: 'readonly' },
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'web-build/', '.expo/', 'server/'],
  },
);

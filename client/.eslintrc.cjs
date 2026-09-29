/**
 * ESLint config for the client.
 *
 * This file did not exist previously, so the `npm run lint` script could not
 * run at all. Keeping the config in the repo is what stops unused imports,
 * dead context values and hook dependency bugs from silently creeping back in.
 */
module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react', 'react-hooks'],
  settings: { react: { version: 'detect' } },
  rules: {
    // Marks JSX-referenced identifiers as used, so `import React` is not
    // flagged under Vite's automatic JSX runtime.
    'react/jsx-uses-vars': 'error',
    'react-hooks/rules-of-hooks': 'error',
    // Left as a warning: it flags the stale-closure in
    // pages/employee/BookRoom.jsx that still needs a deliberate fix.
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],
    // The codebase hand-rolls modals, dropdowns and menus throughout, so
    // prop-types would be noise rather than signal.
    'react/prop-types': 'off',
  },
  ignorePatterns: ['dist', 'node_modules'],
};

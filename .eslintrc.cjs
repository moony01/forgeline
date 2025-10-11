module.exports = {
  root: true,
  ignorePatterns: ['**/dist/**', '**/node_modules/**'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    'vue/multi-word-component-names': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
    },
    {
      files: ['packages/forgeline-mcp-server/plugin/code.js'],
      env: {
        browser: true,
      },
      globals: {
        figma: 'readonly',
        __html__: 'readonly',
      },
    },
  ],
};

module.exports = {
  root: true,
  env: {
    node: true,
    webextensions: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-unused-vars': 'warn',
    'vue/no-unused-components': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    'no-prototype-builtins': 'off',
    'prefer-const': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    '@typescript-eslint/ban-ts-ignore': 'off',
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}

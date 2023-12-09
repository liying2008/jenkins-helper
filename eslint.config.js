import antfu from '@antfu/eslint-config'

export default antfu(
  { vue: true, typescript: true },
  {
    // Remember to specify the file glob here, otherwise it might cause the vue plugin to handle non-vue files
    files: ['**/*.vue'],
    rules: {
      'vue/no-unused-components': 'warn',
      'vue/no-unused-vars': 'warn',
      'vue/no-multi-spaces': 'error',
      'vue/html-self-closing': 'off',
      'vue/no-v-html': 'off',
      'vue/mustache-interpolation-spacing': 'error',
      'vue/max-attributes-per-line': ['warn', {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      }],
      'vue/first-attribute-linebreak': ['warn', {
        singleline: 'beside',
        multiline: 'below',
      }],
      'vue/html-closing-bracket-spacing': ['error', {
        startTag: 'never',
        endTag: 'never',
        selfClosingTag: 'always',
      }],
      'vue/component-name-in-template-casing': 'off',
    },
  },
  {
    // Without `files`, they are general rules for all files
    rules: {
      'curly': ['error', 'multi-line'],
      'prefer-const': 'warn',
      'no-console': 'off',
      'no-debugger': 'off',
      'no-alert': 'off',
      'no-prototype-builtins': 'off',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'warn',
      'node/prefer-global/process': 'off',
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'ts/no-unused-vars': 'warn',
      'style/arrow-parens': ['error', 'always'],
    },
  },
)

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:nuxt/recommended', 'plugin:vue/vue3-recommended'],
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  ],
  rules: {
    'vue/valid-v-slot': [
      'error',
      {
        allowModifiers: true
      }
    ],
    'comma-dangle': ['error', 'never'],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 1,
        multiline: 1
      }
    ],
    'vue/block-tag-newline': ['error', {
      singleline: 'always',
      multiline: 'always'
    }],
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      {
        registeredComponentsOnly: true
      }
    ],
    // Off as page names can be single word (in our case)
    'vue/multi-word-component-names': 'off'
  }
};

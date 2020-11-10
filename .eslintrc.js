module.exports = {
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue-scoped-css/recommended'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'warn',
    'no-useless-constructor': 'off',
    'space-before-function-paren': ['error', 'never'],
    '@typescript-eslint/no-unused-vars': 'warn',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/singleline-html-element-content-newline': 0,
    'vue/max-attributes-per-line': 0,
    'vue/no-v-html': 'off',
    'no-useless-escape': 'off',
    'no-unused-expressions': 'off'
    // "vue-scoped-css/require-selector-used-inside": "warn"
  },
  ignorePatterns: ['parrots'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-dupe-class-members': 'off'
      }
    }
  ]
}

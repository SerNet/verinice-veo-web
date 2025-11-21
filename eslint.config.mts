import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt({
  features: { stylistic: false, tooling: true }
})
  // TypeScript rules
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // permitted: intentional escape hatch
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-invalid-void-type': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }]
    }
  })
  // Vue rules
  .override('nuxt/vue/rules', {
    rules: {
      'vue/no-template-shadow': 'error',
      'vue/no-v-text-v-html-on-component': 'error',
      'vue/valid-v-slot': ['error', { allowModifiers: true }],
      'vue/no-required-prop-with-default': 'off', // disabled: valid defaults allowed
      'vue/return-in-computed-property': 'error',
      'vue/no-parsing-error': 'error',
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'any', // <br> OR <br /> allowed
            normal: 'never', // <div></div> allowed but not <div />
            component: 'any' // <MyComp /> OR <MyComp></MyComp> allowed
          }
        }
      ],
      'vue/define-props-declaration': ['off', 'type-based'], // pending: #4345
      'vue/define-emits-declaration': ['off', 'type-based'] // pending: #4346
    }
  })
  // Import rules
  .override('nuxt/import/rules', {
    rules: {
      'import/first': 'off', // disabled: conflicts with tooling transforms
      'import/no-duplicates': 'off' // disabled: false positives with type imports
    }
  })
  // Plugin/tooling rules
  .append([
    {
      rules: {
        'no-console': ['error', { allow: ['info', 'error'] }], // restricted logging policy - only allow info & error
        'unicorn/prefer-dom-node-text-content': 'off', // disabled: nonessential cosmetic rule
        'unicorn/prefer-node-protocol': 'off', // disabled: avoid import churn e.g. path/node:path
        'unicorn/prefer-number-properties': 'off', // disabled: unnecessary verbosity
        'nuxt/prefer-import-meta': 'off', // disabled: migration not required
        'jsdoc/check-param-names': 'off' // disabled: low-value strictness
      }
    }
  ]);

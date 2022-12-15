module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nbrx/eslint-config-nuxt',
    'plugin:@typescript-eslint/recommended',
    'plugin:nuxt/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // https://git.nbrx.de/nbrx/t1/nuxt-linting/-/issues/2
    'vue/valid-v-slot': [
      'error',
      {
        allowModifiers: true
      }
    ]
  }
};

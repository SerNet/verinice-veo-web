module.exports = {
  extends: ['@nbrx/eslint-config-nuxt'],
  rules: {
    // https://git.nbrx.de/nbrx/t1/nuxt-linting/-/issues/2
    'vue/valid-v-slot': [
      'error',
      {
        allowModifiers: true
      }
    ]
  },
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        // Typescript takes care that no properties of a potentially undefined variable are accessed.
        // Therefore, the eslint check in these files is superfluous (and sometimes leads to false positives)
        'no-undef': ['off'],
        // it also takes care of overloading and duplicate class members
        'no-dupe-class-members': ['off']
      }
    }
  ]
};

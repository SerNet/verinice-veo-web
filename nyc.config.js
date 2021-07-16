module.exports = {
  extends: '@istanbuljs/nyc-config-typescript',
  all: true,
  'check-coverage': true,
  'report-dir': './cypress/coverage',
  'temp-dir': './cypress/.nyc_output',
  extension: ['.js', '.ts', '.vue'],
  exclude: ['**/*.{spec,test}.{js,ts}', '.nuxt/'],
  include: ['pages/**/*.{vue,ts}', 'layouts/**/*.{vue,ts}', 'components/**/*.{vue,ts}', 'module/**/*.js', 'mixin/**/*.js', 'store/**/*.js']
};

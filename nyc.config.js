module.exports = {
  extends: '@istanbuljs/nyc-config-typescript',
  all: true,
  'check-coverage': false, // set true if you want to check, whether it is whithin coverage threshold 90%
  extension: ['.js', '.ts', '.vue'],
  exclude: ['**/*.{spec,test}.{js,ts}', '.nuxt/'],
  include: ['pages/**/*.{vue,ts}', 'layouts/**/*.{vue,ts}', 'components/**/*.{vue,ts}', 'module/**/*.js', 'mixin/**/*.js', 'store/**/*.js']
};

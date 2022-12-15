module.exports = {
  testRegex: '(/__tests__/.*|/test/unit/.*\\.(test|spec))\\.(ts|tsx)$',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  transform: {
    '^.+\\.vue$': '@vue/vue2-jest',
    '\\.[jt]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)'],
  roots: ['<rootDir>'],
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/components/**/*.vue'],
  snapshotSerializers: ['jest-serializer-vue'],
  preset: 'ts-jest',
  testMatch: null,
  verbose: true,
  reporters: ['default', 'jest-junit'],
  setupFiles: ['./test/config/setup.js', './test/config/mocks.js']
};

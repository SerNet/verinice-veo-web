module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: true
    },
    NODE_ENV: 'test'
  },
  testRegex: '(/__tests__/.*|/test/unit/.*\\.(test|spec))\\.(ts|tsx)$',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vuetify/lib$': 'vuetify'
  },
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  roots: ['<rootDir>'],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(@babel)/)', '<rootDir>/test/e2e'],
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/components/**/*.vue', '<rootDir>/pages/**/*.vue'],
  snapshotSerializers: ['jest-serializer-vue'],
  preset: 'ts-jest/presets/js-with-ts',
  testMatch: null,
  verbose: true,
  reporters: ['default', 'jest-junit']
};

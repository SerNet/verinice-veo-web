/**
 * Just for IntelliJ
 */
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './'),
      '@app': path.resolve(__dirname, './'),
    },
  },
};

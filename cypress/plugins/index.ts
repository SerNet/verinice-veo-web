/// <reference types="cypress" />

const { initPlugin } = require('cypress-plugin-snapshots/plugin');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  initPlugin(on, config);
  require('@cypress/code-coverage/task')(on, config);
  return config;
};

// import { defineConfig } from "cypress";
// use require to prevent issues in cypress docker (Gitlab)
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  defaultCommandTimeout: 30000,
  requestTimeout: 30000,
  e2e: {
    //excludeSpecPattern: ['*/*/**/createElements.cy.ts'],
    setupNodeEvents(_on, config) {
      // Load cypress.env.[environment].json files for different environments
      // if version not defined, use local
      const environment = config.env.environment || 'local';
      // load env from json
      config.env = require(`cypress/config/cypress.env.${environment}.json`);
      // change baseUrl
      config.baseUrl = config.env.baseUrl;
      return config;
    }
  }
});

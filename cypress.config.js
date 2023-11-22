// import { defineConfig } from "cypress";
// use require to prevent issues in cypress docker (Gitlab)
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
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

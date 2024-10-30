// import { defineConfig } from "cypress";
// use require to prevent issues in cypress docker (Gitlab)

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  retries: 2,
  defaultCommandTimeout: 30000,
  requestTimeout: 30000,
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

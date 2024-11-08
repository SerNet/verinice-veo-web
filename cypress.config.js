// import { defineConfig } from "cypress";
// use require to prevent issues in cypress docker (Gitlab)

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require('cypress');
const fs = require('fs');

module.exports = defineConfig({
  retries: 2,
  video: true, // Let's enable video recording by default
  defaultCommandTimeout: 8000,
  requestTimeout: 15000,
  e2e: {
    setupNodeEvents(on, config) {
      // Load cypress.env.[environment].json files for different environments
      // if version not defined, use local
      const environment = config.env.environment || 'local';
      // load env from json
      config.env = require(`cypress/config/cypress.env.${environment}.json`);
      // change baseUrl
      config.baseUrl = config.env.baseUrl;

      // delete the video if the spec passed and no tests retried
      on('after:spec', (spec, results) => {
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) => test.attempts.some((attempt) => attempt.state === 'failed'));
          if (!failures) {
            // delete the video if the spec passed and no tests retried
            fs.unlinkSync(results.video);
          }
        }
      });
      return config;
    }
  }
});

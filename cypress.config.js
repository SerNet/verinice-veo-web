// import { defineConfig } from "cypress";
// use require to prevent issues in cypress docker (Gitlab)

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require('cypress');
const fs = require('fs');

module.exports = defineConfig({
  retries: 2,
  video: false, // disable video recording
  numTestsKeptInMemory: 1,
  experimentalMemoryManagement: true,
  defaultCommandTimeout: 30000,
  requestTimeout: 30000,
  e2e: {
    setupNodeEvents(on, config) {
      // Load cypress.env.[environment].json files for different environments
      // if version not defined, use local
      const environment = config.env.environment || 'local';
      // load env from json
      config.env = require(`cypress/config/cypress.env.${environment}.json`);
      // change baseUrl
      config.baseUrl = config.env.baseUrl;
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'electron') {
          launchOptions.preferences.webPreferences = {
            ...launchOptions.preferences.webPreferences,
            sandbox: true,
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false
          };

          launchOptions.preferences = {
            ...launchOptions.preferences,
            webSecurity: false
          };
          launchOptions.args['--js-flags'] = '--max-old-space-size=8192';
          launchOptions.args['--disable-gpu'] = true;
          launchOptions.args['--disable-dev-shm-usage'] = true;
          launchOptions.args['--no-sandbox'] = true;
          launchOptions.args['--disable-gl-drawing-for-tests'] = true;
        }
        launchOptions.preferences.width = 1024;
        launchOptions.preferences.height = 768;
        return launchOptions;
      });

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

// import { defineConfig } from 'cypress';

/* eslint-disable @typescript-eslint/no-require-imports -- use *require* to prevent issues in cypress docker (Gitlab) */
const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const pdfParse = require('pdf-parse');
/* eslint-enable @typescript-eslint/no-require-imports */

module.exports = defineConfig({
  retries: 1,
  video: true, // Let's enable video recording by default
  defaultCommandTimeout: 30000,
  requestTimeout: 15000,
  experimentalMemoryManagement: true,
  numTestsKeptInMemory: 0,

  // disable the user settings test via feature flag
  env: {
    VEO_FEATURE_FLAG_USER_SETTINGS: 'false'
  },
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        readTutorialYaml(fileName) {
          const filePath = path.join(__dirname, '/content/tutorials', fileName);
          if (!fs.existsSync(filePath)) {
            throw new Error(`YAML file not found: ${filePath}`);
          }
          const fileContent = fs.readFileSync(filePath, 'utf8');
          return yaml.load(fileContent);
        },

        parsePdf(pdfBuffer) {
          return pdfParse(Buffer.from(pdfBuffer)).then((data) => ({
            text: data.text,
            pageCount: data.numpages
          }));
        }
      });
      // Load cypress.env.[environment].json files for different environments
      // if version not defined, use local
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'firefox') {
          launchOptions.preferences['network.proxy.testing_localhost_is_secure_when_hijacked'] = true;
        }
        return launchOptions;
      });
      const environment = config.env.environment || 'local';
      // load env from json
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      config.env = require(`cypress/config/cypress.env.${environment}.json`);
      // change baseUrl
      config.baseUrl = config.env.baseUrl;

      // delete the video if the spec passed and no tests retried
      on('after:spec', (spec, results) => {
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) => test.attempts.some((attempt) => attempt.state === 'failed'));
          if (!failures && fs.existsSync(results.video)) {
            // delete the video if the spec passed and no tests retried
            fs.unlinkSync(results.video);
          }
        }
      });
      return config;
    }
  }
});

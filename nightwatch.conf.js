/**
 * Taken and modified from https://github.com/dwyl/learn-nightwatch
 */
// require('env2')('.env') // optionally store your Evironment Variables in .env
const BROWSER = 'internet explorer';//process.env.BROWSER;
const SCREENSHOT_PATH = './screenshots/'+BROWSER;

const path = require('path');

// we use a nightwatch.conf.js file so we can include comments and helper functions
module.exports = {
  'src_folders': [
    'test/nightwatch/screenshots',// Where you are storing your Nightwatch tests
  ],
  'output_folder': './reports', // reports (test outcome) output by nightwatch
  'selenium': { // downloaded by selenium-download module (see readme)
    'start_process': false, // tells nightwatch to start/stop the selenium process
    start_session: true,
    'port': 80
  },
  'test_settings': {
    'default': {
      "selenium_port"  : 443,
      "selenium_host"  : "selenium.cpmsys.io",
      "ssl": true,
      "username": "gitlab-ci-token",
      "password": process.env['CI_JOB_TOKEN'],
      'screenshots': {
        'enabled': true, // if you want to keep screenshots
        'path': SCREENSHOT_PATH, // save screenshots here
      },
      'globals': {
        'waitForConditionTimeout': 10000, // sometimes internet is slow so wait.
        'asyncHookTimeout': 60000,
        'root_url': process.env['CI_ENVIRONMENT_URL']
      },
      'desiredCapabilities': { // use Chrome as the default browser for tests
        'browserName': BROWSER,
      },
    },
    'chrome': {
      'desiredCapabilities': {
        'browserName': BROWSER,
        'javascriptEnabled': true, // turn off to test progressive enhancement
      },
    },
  },
};

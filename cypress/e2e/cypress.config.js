// import { defineConfig } from "cypress";
// use require to prevent issues in cypress docker (Gitlab)
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://veo-web.develop.verinice.com',
  }
});

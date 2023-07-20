import { defineConfig } from "cypress";

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://veo-web.develop.verinice.com',
    // baseUrl: 'http://localhost:3000',
  }
});

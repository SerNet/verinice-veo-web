import { Nuxt } from '@nuxt/schema';
import vuetify from 'vite-plugin-vuetify';

// Add
export default async (_inlineOptions: object, nuxt: Nuxt) => {
  nuxt.hooks.hook('vite:extendConfig', (config) => {
    config.plugins.push(
      vuetify({
        styles: { configFile: './assets/styles/vuetify/variables.scss' }
      })
    );
  });
};

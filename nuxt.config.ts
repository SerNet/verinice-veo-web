import { resolve } from "path";
import DocsModule from './modules/docs/module.mjs';


// Types
import { LOCALES } from "./types/locales";
import { PluginOption } from 'vite';

/** UNIT TESTING
* When testing the application, vue + vuetify are not available,
* thus we have to import/plug them in manually
* however, in dev mode or when building this causes an ERROR,
* that is why we only add vue + vuetify in when testing
*/
import vue from "@vitejs/plugin-vue";
import vuetify from 'vite-plugin-vuetify';
let vitePlugins: PluginOption[] = [];
if (process.env.NODE_ENV === 'test') vitePlugins = [vue(), vuetify({autoImport: true})];

export default defineNuxtConfig({
  //==============================================================
  // Base configuration
  //==============================================================
  telemetry: false,

  sourcemap: {
    server: true,
    client: false
  },

  typescript: {
    shim: false // Disabled, as Takeover mode and Volar should be enabled/installed
  },

  // Apply a transition to every page
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  // Disable SSR as the app is deployed using static site generation (SSG)
  ssr: false,

  // Available via useRuntimeConfig().public
  runtimeConfig: {
    public: {
      version: process.env.npm_package_version || 'latest',
      build: process.env.CI_COMMIT_SHORT_SHA || '0000000',
      buildTime: new Date(parseInt(process.env.CI_COMMIT_TIMESTAMP || Date.now().toString(), 10)).toISOString(),
      buildNumber: process.env.CI_JOB_ID || '-1',
      apiUrl: process.env.VEO_DEFAULT_API_URL || 'https://api.veo.example/veo',
      formsApiUrl: process.env.VEO_FORMS_API_URL || 'https://api.veo.example/forms',
      historyApiUrl: process.env.VEO_HISTORY_API_URL || 'https://api.veo.example/history',
      reportsApiUrl: process.env.VEO_REPORTING_API_URL || 'https://api.veo.example/reporting',
      accountsApiUrl: process.env.VEO_ACCOUNTS_API_URL || 'https://api.veo.example/accounts',
      oidcUrl: process.env.VEO_OIDC_URL || 'https://auth.veo.example/auth',
      oidcRealm: process.env.VEO_OIDC_REALM || 'veo-oidcrealm-example',
      oidcClient: process.env.VEO_OIDC_CLIENT || 'veo-oidcclient-example',
      accountPath: process.env.VEO_ACCOUNT_PATH || 'https://account.veo.example',
      debug: process.env.VEO_DEBUG || 'false',
      debugCache: process.env.VEO_DEBUG_CACHE || 'false', // Either a boolean or the query string (or first entry of query string if array)
      securityPolicyInvalidationDate: process.env.VEO_SECURITY_POLICY_INVALIDATION_DATE_TIMESTAMP ? new Date(parseInt(process.env.VEO_SECURITY_POLICY_INVALIDATION_DATE_TIMESTAMP)) : new Date(new Date().getFullYear() + 1, 0, 1)
    }
  },

  // Modules are buildtime only. Can be used to modify build behaviour
  modules: [
    DocsModule as any,
    '@nuxt/content',
    '@nuxtjs/i18n',
    './modules/externalize-scripts',
    './modules/vuetify-sass-variables.ts',
    'nuxt-font-loader'
  ],

  // Transpile vuetify
  build: {
    transpile: ['vuetify']
  },

  vite: {
    plugins: vitePlugins,
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/global.scss";'
        }
      }
    }
  },

  //==============================================================
  // Plugin configuration
  //==============================================================
  // Nuxt content configuration
  content: {
    sources: {
      // overwrite default source AKA `content` directory
      content: {
        driver: 'fs',
        base: resolve(__dirname, 'docs')
      }
    },
    markdown: {
      rehypePlugins: [
        'rehype-inline'
      ]
    },
    experimental: {
      clientDB: true
    },
    locales: LOCALES.map((locale) => locale.code),
    defaultLocale: 'de',
    toc: {
      depth: 5
    }
  },

  // i18n configuration
  i18n: {
    strategy: 'no_prefix',
    locales: LOCALES,
    defaultLocale: 'de',
    lazy: true,
    langDir: 'locales/'
  },

  fontLoader: {
    local: [
      {
        src: '/Roboto-Regular.ttf',
        family: 'Roboto'
      },
      {
        src: '/OpenSans-Regular.ttf',
        family: 'Open Sans'
      }
    ]
  }
});

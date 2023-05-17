import { resolve } from "path";

import DocsModule from './modules/docs/module.mjs';
import { LOCALES } from "./types/locales";

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
      apiUrl: process.env.VEO_DEFAULT_API_URL || 'https://api.develop.verinice.com/veo',
      formsApiUrl: process.env.VEO_FORMS_API_URL || 'https://api.develop.verinice.com/forms',
      historyApiUrl: process.env.VEO_HISTORY_API_URL || 'https://api.develop.verinice.com/history',
      reportsApiUrl: process.env.VEO_REPORTING_API_URL || 'https://api.develop.verinice.com/reporting',
      accountsApiUrl: process.env.VEO_ACCOUNTS_API_URL || 'https://api.develop.verinice.com/accounts',
      oidcUrl: process.env.VEO_OIDC_URL || 'https://auth.staging.verinice.com/auth',
      oidcRealm: process.env.VEO_OIDC_REALM || 'verinice-veo',
      oidcClient: process.env.VEO_OIDC_CLIENT || 'veo-development-client',
      accountPath: process.env.VEO_ACCOUNT_PATH || 'https://account.verinice.com',
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
    langDir: 'locales/',
    vueI18n: {
      legacy: false,
      silentFallbackWarn: true,
      datetimeFormats: Object.fromEntries(
        ['de', 'en'].map((lang) => [
          lang,
          {
            long: {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            },
            short: {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }
          }
        ])
      )
    }
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

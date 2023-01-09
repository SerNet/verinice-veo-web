export default defineNuxtConfig({
  //==============================================================
  // Base configuration
  //==============================================================
  typescript: {
    shim: false // Disabled, as Takeover mode and Volar should be enabled/installed
  },

  // Available via useRuntimeConfig().public
  runtimeConfig: {
    public: {
      version: process.env.npm_package_version || 'latest',
      build: process.env.CI_COMMIT_SHA || '0000000',
      commitTimestamp: process.env.CI_COMMIT_TIMESTAMP || Date.now(),
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
      debug: process.env.VEO_DEBUG || false,
      debugCache: process.env.VEO_DEBUG_CACHE || false // Either a boolean or the query string (or first entry of query string if array)
    }
  },

  // Modules are buildtime only. Can be used to modify build behaviour
  modules: [
    '@nuxt/content',
    '@nuxtjs/i18n',
    './modules/docs',
    './modules/externalize-scripts',
    './modules/generate-doc-pages.ts'
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
    dir: 'docs',
    liveEdit: false,
    markdown: {
      // inline images as base64 urls
      rehypePlugins: ['rehype-inline']
    }
  },

  // i18n configuration
  i18n: {
    strategy: 'no_prefix',
    locales: [
      { code: 'de', file: 'de.json', name: 'Deutsch' },
      { code: 'en', file: 'en.json', name: 'English' }
    ],
    defaultLocale: 'de',
    lazy: true,
    langDir: 'locales/',
    vueI18nLoader: true,
    vueI18n: {
      legacy: false,
      silentFallbackWarn: true,
      dateTimeFormats: Object.fromEntries(
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
  }
});

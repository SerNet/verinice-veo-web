import { resolve } from 'path';

// Types
import { LOCALES } from './types/locales';

export default defineNuxtConfig({
  //==============================================================
  // Base configuration
  //==============================================================
  telemetry: false,

  sourcemap: {
    server: true,
    client: false
  },

  vue: {
    runtimeCompiler: true
  },

  typescript: {
    // Disable, because Takeover mode and Volar should be used
    shim: false,
    tsConfig: {
      compilerOptions: {
        // Allow type imports without `type` modifier
        verbatimModuleSyntax: false,
        noUncheckedIndexedAccess: false,
        noImplicitAny: false,
        strictNullChecks: false,
        skipLibCheck: true
      }
    }
  },

  // Apply a transition to every page
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  // Disable SSR as the app is deployed using static site generation (SSG)
  ssr: false,

  // Available via useRuntimeConfig().public
  // When changing env vars: change `Dockerfile` and `startup.sh` accordingly!
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
      oidcAccountApplication:
        process.env.VEO_OIDC_ACCOUNT_APPLICATION ||
        'https://auth.veo.example/auth/realms/veo-oidcrealm-example/account',
      oidcRealm: process.env.VEO_OIDC_REALM || 'veo-oidcrealm-example',
      oidcClient: process.env.VEO_OIDC_CLIENT || 'veo-oidcclient-example',
      accountPath: process.env.VEO_ACCOUNT_PATH || 'https://account.veo.example',
      debug: process.env.VEO_DEBUG || 'false',
      debugCache: process.env.VEO_DEBUG_CACHE || 'false', // Either a boolean or the query string (or first entry of query string if array)
      securityPolicyInvalidationDate:
        process.env.VEO_SECURITY_POLICY_INVALIDATION_DATE_TIMESTAMP ?
          new Date(parseInt(process.env.VEO_SECURITY_POLICY_INVALIDATION_DATE_TIMESTAMP))
        : new Date(new Date().getFullYear() + 1, 0, 1),
      documentationUrl: process.env.VEO_DOCUMENTATION_URL || 'veo-documentation-url-example',
      isBetaMode: process.env.VEO_BETA_MODE || 'veo-beta-mode-example'
    }
  },

  // Modules are buildtime only. Can be used to modify build behaviour
  modules: [
    '@nuxt/content',
    '@nuxtjs/i18n',
    './modules/vuetify-sass-variables.ts',
    'nuxt-font-loader',
    '@nuxt/test-utils/module'
  ],

  build: {
    transpile: ['vuetify', 'hast-util-to-string', 'micromark']
  },

  vite: {
    resolve: {
      alias: {
        '@toast-ui': resolve(__dirname, 'node_modules/@toast-ui')
      }
    },
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
    build: {
      markdown: {
        toc: {
          depth: 5 // include h3 headings
        },
        // Object syntax can be used to override default options
        remarkPlugins: {
          // Override remark-emoji options
          'remark-emoji': {
            options: {
              emoticon: true
            }
          },
          // Disable remark-gfm
          'remark-gfm': false,
          // Add remark-oembed
          'remark-oembed': {
            // Options
          }
        }
      }
    }
  },

  // i18n configuration
  i18n: {
    strategy: 'no_prefix',
    locales: LOCALES,
    defaultLocale: 'de',
    lazy: true,
    langDir: '../locales/base/'
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

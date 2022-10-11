export default {
  /**
   *
   */
  ssr: false,

  /**
   *
   */
  server: {
    host: '0.0.0.0'
  },

  /*
   ** Headers of the page
   */
  head: {
    title: 'verinice.veo',
    meta: [
      {
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, user-scalable=no'
      },
      {
        'http-equiv': 'X-UA-Compatible',
        content: 'IE=edge'
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  /**
   * Enable nuxt/components
   * @see https://github.com/nuxt/components
   */
  components: [
    {
      path: '~/components',
      pathPrefix: false
    }
  ],

  /**
   * Build as a static application. App will get generated as html and js files and will on any webserver able to handle html files
   */
  target: 'static',

  /**
   *
   */
  publicRuntimeConfig: {
    version: process.env.npm_package_version || 'latest',
    build: process.env.CI_COMMIT_SHA || '0000000',
    commitTimestamp: process.env.CI_COMMIT_TIMESTAMP || Date.now(),
    buildNumber: process.env.CI_JOB_ID || '-1',
    apiUrl: process.env.VEO_DEFAULT_API_URL || 'https://api.develop.verinice.com/veo',
    formsApiUrl: process.env.VEO_FORMS_API_URL || 'https://api.develop.verinice.com/forms',
    historyApiUrl: process.env.VEO_HISTORY_API_URL || 'https://api.develop.verinice.com/history',
    reportsApiUrl: process.env.VEO_REPORTING_API_URL || 'https://api.develop.verinice.com/reporting',
    oidcUrl: process.env.VEO_OIDC_URL || 'https://auth.staging.verinice.com/auth',
    oidcRealm: process.env.VEO_OIDC_REALM || 'verinice-veo',
    oidcClient: process.env.VEO_OIDC_CLIENT || 'veo-development-client',
    accountPath: process.env.VEO_ACCOUNT_PATH || 'https://account.verinice.com',
    debug: process.env.VEO_DEBUG || false,
    debugCache: process.env.VEO_DEBUG_CACHE || false // Either a boolean or the query string (or first entry of query string if array)
  },

  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['~/plugins/api', '~/plugins/navigationHelper', '~/plugins/user', '~/plugins/utils', '~/plugins/vue-query', '~/plugins/font-awesome'],

  /**
   *
   */
  generate: {
    fallback: '404.html', // if you want to use '404.html'
    async routes() {
      const { $content } = require('@nuxt/content');
      const files = await $content({ deep: true }).only(['path']).fetch();
      const routes = ['/docs?print', ...new Set(files.map((file) => '/docs' + file.path.replace(/\.\w+$/, '').replace(/\/index$/, '/'))).values()];
      return routes;
    }
  },

  router: {
    middleware: ['authentication', 'unitValidation']
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    'nuxt-polyfill',
    '@nuxt/content',
    [
      '@nuxtjs/i18n',
      {
        languages: ['de', 'en'],
        defaultLanguage: 'de',
        vueI18nLoader: true,
        vueI18n: {
          silentFallbackWarn: true
        }
      }
    ]
  ],
  content: {
    dir: 'docs',
    liveEdit: false,
    markdown: {
      // inline images as base64 urls
      rehypePlugins: ['rehype-inline']
    }
  },
  /**
   * @nuxtjs/i18n config
   */
  i18n: {
    strategy: 'no_prefix',
    locales: [
      { code: 'de', file: 'de.ts', name: 'Deutsch' },
      { code: 'en', file: 'en.ts', name: 'English' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieCrossOrigin: true,
      cookieDomain: null,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: true,
      fallbackLocale: 'de'
    },
    defaultLocale: 'de',
    lazy: true,
    langDir: 'locales/',
    vueI18nLoader: true,
    vueI18n: {
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
  },

  /**
   * Polyfill configuration
   */
  polyfill: {
    features: [
      {
        require: 'intersection-observer',
        detect: () => 'IntersectionObserver' in window
      },
      {
        require: 'resize-observer',
        detect: () => 'ResizeObserver' in window
      }
    ]
  },

  /*
   ** Nuxt.js build modules
   */
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/composition-api/module', '@nuxtjs/vuetify', './modules/docs', './modules/externalize-scripts'],

  /**
   * Vuetify configuration
   */
  vuetify: {
    customVariables: ['~/assets/vuetify.scss'],
    defaultAssets: false,
    treeShake: true, // needed for IE11 -> transpile: vuetify/lib
    optionsPath: '~/plugins/vuetify.options.ts'
  },

  /**
   *
   */
  css: ['~/assets/main.scss', '~/assets/intro.scss'],

  /**
   *
   */
  loaders: {
    vue: {
      transformAssetUrls: {
        'v-img': ['src', 'lazy-src'],
        'v-image': ['src', 'lazy-src'],
        'v-card': 'src',
        'v-responsive': 'src'
      }
    }
  },

  /*
   ** Build configuration
   */
  build: {
    publicPath: process.env.NUXT_PUBLIC_PATH || '/_nuxt/',
    transpile: [/\.(?!(?:js|json)$).{1,5}$/i, /^vue-flag-icon/],
    babel: {
      presets: ['@nuxt/babel-preset-app'],
      plugins: [
        [
          'babel-plugin-istanbul',
          {
            extension: ['.js', '.ts', '.vue'],
            exclude: ['**/*.{spec,test}.{js,ts}', '.nuxt/'],
            include: ['pages/**/*.{vue,ts}', 'layouts/**/*.{vue,ts}', 'components/**/*.{vue,ts}', 'module/**/*.js', 'mixin/**/*.js', 'store/**/*.js']
          }
        ]
      ]
    }
  }
};

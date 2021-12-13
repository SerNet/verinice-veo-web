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
    title: 'Bitte warten...',
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
    apiUrl: (process.env.VEO_API_URL || 'https://api.develop.verinice.com/') + 'veo',
    formsApiUrl: (process.env.VEO_API_URL || 'https://api.develop.verinice.com/') + 'forms',
    historyApiUrl: (process.env.VEO_API_URL || 'https://api.develop.verinice.com/') + 'history',
    reportsApiUrl: (process.env.VEO_API_URL || 'https://api.develop.verinice.com/') + 'reporting',
    oidcUrl: process.env.VEO_OIDC_URL || 'https://keycloak.staging.verinice.com/auth',
    oidcRealm: process.env.VEO_OIDC_REALM || 'verinice-veo',
    oidcClient: process.env.VEO_OIDC_CLIENT || 'veo-development-client'
  },

  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['~/plugins/vee-validate', '~/plugins/user', '~/plugins/api', '~/plugins/utils'],

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
    middleware: ['authentication', 'unitValidation', 'navigationHelper']
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    'nuxt-polyfill',
    '@nuxt/content',
    [
      'nuxt-i18n',
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
      remarkPlugins: []
    }
  },
  hooks: {
    'content:file:beforeInsert': (document) => {
      if (document.extension === '.md') {
        const [slug, lang] = document.slug.split('.');
        if (lang) {
          document.lang = lang;
          document.slug = slug;
        }
      }
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
      silentFallbackWarn: true
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
      }
    ]
  },

  /*
   ** Nuxt.js build modules
   */
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/composition-api/module', '@nuxtjs/vuetify'],

  /**
   * Vuetify configuration
   */
  vuetify: {
    defaultAssets: false,
    treeShake: true, // needed for IE11 -> transpile: vuetify/lib
    optionsPath: '~/plugins/vuetify.options.ts'
  },

  /**
   *
   */
  css: ['~/assets/main.scss', '~/assets/util.scss', '~/assets/vuetify.scss'],

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

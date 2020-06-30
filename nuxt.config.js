require('dotenv').config()

module.exports = {
  /**
   *
   */
  mode: 'spa',

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
    ]
  },

  /**
   *
   */
  env: {
    CI_COMMIT_REF_NAME: process.env.CI_COMMIT_REF_NAME,
    CI_COMMIT_SHA: process.env.CI_COMMIT_SHA
  },

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/logger',
    '~/plugins/auth',
    '~/plugins/api',
    '~/plugins/veo-forms'
  ],

  /**
   *
   */
  generate: {
    fallback: '404.html' // if you want to use '404.html'
  },

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
    '@nuxtjs/pwa',
    ['cookie-universal-nuxt', { parseJSON: false }],
    'nuxt-polyfill',
    'nuxt-i18n'
  ],

  /**
   * module: nuxt-pwa configuration
   */
  pwa: {
    workbox: {
      autoRegister: true,
      dev: false
    },
    meta: {
      mobileAppIOS: true,
      nativeUI: true,
      favicon: true
    },
    icon: {
      sizes: [16, 120, 144, 152, 192, 384, 512]
    },
    manifest: {
      name: 'verinice veo',
      lang: 'en'
    }
  },

  /**
   * nuxt-i18n config
   */
  i18n: {
    strategy: 'no_prefix',
    locales: [
      { code: 'en', file: 'en.ts', name: 'English' },
      { code: 'de', file: 'de.ts', name: 'Deutsch' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieDomain: null,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: false,
      fallbackLocale: 'en'
    },
    defaultLocale: 'en',
    lazy: true,
    langDir: 'locales/'
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
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify'
  ],

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
  css: [
    '~/assets/vuetify.scss'
  ],

  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    credentials: true,
    proxyHeaders: true,
    retry: false,
    browserBaseURL: '/',
    timeout: 10000
  },

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
    transpile: [/\.(?!(?:js|json)$).{1,5}$/i, /^vue-flag-icon/]
  },

  /**
   * Proxy configuration
   */
  proxy: {
    '/api': {
      target: process.env.VEO_API_HOST || 'https://veo-api.cfapps.io/',
      pathRewrite: { '^/api': '' },
      // TODO: Remove when #VEO-80 is fixed
      onProxyReq(proxyReq) {
        proxyReq.removeHeader('Origin')
      }
    }
  }

  veo: {
    oidc: {
      host: process.env.VEO_OIDC_HOST || 'https://auth-staging.verinice.com/auth',
      realm: process.env.VEO_OIDC_REALM || 'veo-staging',
      client: process.env.VEO_OIDC_CLIENT || 'veo-development-client',
    }
  }
}

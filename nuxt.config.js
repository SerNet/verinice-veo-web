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
  publicRuntimeConfig: {
    version: process.env.CI_COMMIT_REF_NAME || 'latest',
    build: process.env.CI_COMMIT_SHA || '0000000',
    apiUrl: process.env.VEO_API_USE_PROXY !== 'false' ? '/api' : (process.env.VEO_API_URL || 'https://veo.staging.cpmsys.io/'),
    formsApiUrl: process.env.VEO_API_USE_PROXY !== 'false' ? '/api' : (process.env.VEO_FORMS_API_URL || 'https://veo-forms.staging.cpmsys.io/'),
    oidcUrl: process.env.VEO_OIDC_URL || 'https://veo-keycloak.staging.cpmsys.io/auth',
    oidcRealm: process.env.VEO_OIDC_REALM || 'verinice-veo',
    oidcClient: process.env.VEO_OIDC_CLIENT || 'veo-development-client'
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
  proxy: process.env.VEO_API_USE_PROXY !== 'false' ? {
    '/api': {
      target: process.env.VEO_API_URL || 'https://veo.staging.cpmsys.io/',
      pathRewrite: { '^/api': '' },
      /**
       * @param {import('http').ClientRequest} proxyReq
       * @param {import('http').ClientRequest} req
       * @param {import('http').ServerResponse} res
       */
      onProxyReq(proxyReq, req, res) {
        // TODO: Remove when #VEO-80 is fixed
        proxyReq.removeHeader('Origin')
      }
    }
  } : {}
}

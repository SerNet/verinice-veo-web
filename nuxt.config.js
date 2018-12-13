require("dotenv").config();

const pkg = require("./package");
import VuetifyLoaderPlugin from "vuetify-loader/lib/plugin";

module.exports = {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    title: pkg.description
  },

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "~/plugins/axios.js",
    { src: "~/plugins/i18n-error.js", ssr: false },
    "~/plugins/vuetify.js",
    "~/plugins/persistedstate.js"
  ],
  /*
   ** Global CSS
   */
  css: [
    "roboto-fontface/css/roboto/roboto-fontface.css",
    "material-design-icons-iconfont/dist/material-design-icons.css",
    "~/assets/index.styl",
    "~/assets/print.styl"
  ],
  meta: {
    mobileAppIOS: true,
    nativeUI: true
  },

  manifest: {
    name: pkg.description,
    short_name: pkg.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#c62828",
    orientation: "portrait"
  },
  /*
  /*
  ** Customize the progress-bar color
  */
  loading: { color: "#ff1400" },

  generate: {
    fallback: "404.html" // if you want to use '404.html'
  },

  workbox: {
    // Workbox options
    autoRegister: false,
    enabled: false,
    dev: false
  },

  router: {
    middleware: ["auth"],
    extendRoutes(routes, resolve) {}
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    "~/modules/error",
    "~/modules/logger",
    "~/modules/basicauth",
    // Doc: https://github.com/nuxt-community/axios-module#usage
    "@nuxtjs/axios",
    "@nuxtjs/pwa",
    //"~/modules/typescript",
    "nuxt-typescript",
    ["cookie-universal-nuxt", { parseJSON: false }],
    [
      "nuxt-i18n",
      {
        seo: false, //https://github.com/nuxt-community/nuxt-i18n/issues/100#issuecomment-398876743
        lazy: true,
        parsePages: false,
        langDir: "locales/",
        locales: [
          /*{
            code: "en",
            iso: "en-US",
            name: "English",
            file: "en-US.js"
          },*/
          {
            code: "de",
            iso: "de-DE",
            name: "Deutsch",
            file: "de-DE.ts"
          }
        ],
        defaultLocale: "de",
        noPrefixDefaultLocale: true,
        //redirectRootToLocale: 'de',
        vueI18n: {
          numberFormats: {
            de: {
              currency: {
                style: "currency",
                currency: "EUR",
                currencyDisplay: "symbol",
                minimumFractionDigits: 2
              }
            },
            en: {
              currency: {
                style: "currency",
                currency: "EUR",
                currencyDisplay: "code",
                minimumFractionDigits: 2
              }
            }
          },
          dateTimeFormats: {
            de: {
              year: {
                year: "numeric"
              },
              time: {
                hour: "2-digit",
                minute: "2-digit"
              },
              shortDay: {
                weekday: "short"
              },
              short: {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit"
              },
              long: {
                year: "numeric",
                month: "short",
                day: "numeric",
                weekday: "short",
                hour: "numeric",
                minute: "numeric"
              }
            },
            en: {
              year: {
                year: "numeric"
              },
              time: {
                hour: "2-digit",
                minute: "2-digit"
              },
              shortDay: {
                weekday: "short"
              },
              short: {
                year: "2-digit",
                month: "short",
                day: "numeric"
              },
              long: {
                year: "numeric",
                month: "short",
                day: "numeric",
                weekday: "short",
                hour: "numeric",
                minute: "numeric"
              }
            }
          },
          fallbackLocale: "de"
        }
      }
    ]
  ],

  typescript: {
    checker: false,
    babel: {
      sourceMaps: "both"
    }
  },

  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    proxy: true,
    //prefix: '/cgi-bin/',
    credentials: true,
    proxyHeaders: true,
    retry: false,
    timeout: 10000
  },

  proxy: {
    "/api": {
      headers: {
        Origin: process.env["SERVER_URL"] || "https://veo-api.cfapps.io/"
      },
      target: process.env["SERVER_URL"] || "https://veo-api.cfapps.io/",
      //changeOrigin: true,
      pathRewrite: { "^/api": "" }
    }
  },

  extensions: ["ts"],

  /*
   ** Build configuration
   */
  build: {
    transpile: [/^vuetify/],
    plugins: [new VuetifyLoaderPlugin()],
    extractCSS: true,
    cache: false, //(cache-loader: https://github.com/webpack-contrib/cache-loader)
    parallel: false, //(thread-loader: https://github.com/webpack-contrib/thread-loader)
    watch: [".env", "config"],
    babel: {
      babelrc: false
    },
    extend(config, { isDev, isClient }) {
      if (isClient && isDev) config.devtool = "eval-source-map";
    }
  }
};

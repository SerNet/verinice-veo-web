require("dotenv").config();

const pkg = require("./package");
const path = require("path");
const coerce = require("./modules/stylus-coerce");
import VuetifyLoaderPlugin from "vuetify-loader/lib/plugin";

import colors from "vuetify/es5/util/colors";
import theme from "./config/theme";

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
    "~/plugins/error.js",
    "~/plugins/axios.js",
    "~/plugins/router.js",
    "~/plugins/vuetify.js",
    "~/plugins/directives.js",
    { src: "~/plugins/vue-grid.js", ssr: false }
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
    middleware: ["meta"],
    extendRoutes(routes, resolve) {}
  },

  /*
  ** Nuxt.js modules
  */
  modules: [
    "~/modules/logger",
    "~/modules/basicauth",
    // Doc: https://github.com/nuxt-community/axios-module#usage
    "@nuxtjs/axios",
    "@nuxtjs/pwa",
    "~/modules/typescript",
    "cookie-universal-nuxt",
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
            file: "de-DE.js"
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
        Origin: process.env["SERVER_URL"] || "https://v2020-rest.cpmsys.io/"
      },
      target: process.env["SERVER_URL"] || "https://v2020-rest.cpmsys.io/",
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
    //cache: false, //(cache-loader: https://github.com/webpack-contrib/cache-loader)
    //parallel: false, //(thread-loader: https://github.com/webpack-contrib/thread-loader)
    watch: [".env", "config"],
    babel: {
      babelrc: false
    }
  }
};

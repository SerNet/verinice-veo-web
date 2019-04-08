require("dotenv").config();
const pkg = require("./package");
import NuxtConfiguration from "@nuxt/config";

import colors from "vuetify/es5/util/colors";

export default {
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
    "~/plugins/store.ts",
    //"~/plugins/i18n-error.ts",
    //"~/plugins/vuetify.js",
    { src: "~/plugins/routing.ts", ssr: false },
    "~/plugins/persistedstate.js"
  ],
  /*
   ** Global CSS
   */
  css: [
    //"roboto-fontface/css/roboto/roboto-fontface.css",
    //"material-design-icons-iconfont/dist/material-design-icons.css",
    //"~/assets/index.styl",
    //"~/assets/print.styl"
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
    middleware: ["auth"]
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    //"~/modules/error",
    "~/modules/logger",
    "~/modules/basicauth",
    // Doc: https://github.com/nuxt-community/axios-module#usage
    "@nuxtjs/vuetify",
    "@nuxtjs/axios",
    "@nuxtjs/pwa",
    ["cookie-universal-nuxt", { parseJSON: false }]
  ],

  vuetify: {
    theme: {
      primary: colors.red.darken1,
      secondary: colors.red.darken3,
      accent: colors.grey.darken1,
      error: colors.red.accent2,
      info: colors.blue.base,
      success: colors.green.base,
      warning: colors.amber.base,
      primary_text: colors.grey.darken4,
      secondary_text: colors.grey.darken2, //"#727272",
      divider: "#B6B6B6"
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

  build: {
    transpile: [/^vuetify/, /^vuex-typesafe-class/]
  }
} as NuxtConfiguration;

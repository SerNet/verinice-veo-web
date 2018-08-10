const pkg = require("./package");
const path = require("path");
const coerce = require("./modules/stylus-coerce");
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
    "~/plugins/directives.js"
  ],

  /*
  ** Global CSS
  */
  css: [
    "roboto-fontface/css/roboto/roboto-fontface.css",
    "material-design-icons-iconfont/dist/material-design-icons.css",
    "~/assets/vuetify.styl",
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
  loading: { color: "#FF8A80" },

  generate: {
    fallback: "404.html" // if you want to use '404.html'
  },

  workbox: {
    // Workbox options
    autoRegister: true
  },

  router: {
    middleware: ["meta"],
    extendRoutes(routes, resolve) { }
  },

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    "@nuxtjs/axios",
    "@nuxtjs/pwa",
    "~/modules/typescript",
    [
      "nuxt-i18n",
      {
        seo: false, //https://github.com/nuxt-community/nuxt-i18n/issues/100#issuecomment-398876743
        lazy: true,
        parsePages: false,
        langDir: "locales/",
        locales: [
          {
            code: "en",
            iso: "en-US",
            name: "English",
            file: "en-US.js"
          },
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
    proxyHeaders: true
  },

  proxy: {
    /*"/api/": {
      target: "https://v2020-rest.cpmsys.io/",
      pathRewrite: { "^/api/": "" }
    }*/
    "/api/": {
      target: "http://couch.cpmsys.io/veo/_design/api/_rewrite/",
      pathRewrite: { "^/api/": "" }
    }
  },

  extensions: ["ts"],
  /*
  ** Build configuration

  */
  build: {
    cache: false, //(cache-loader: https://github.com/webpack-contrib/cache-loader)
    //parallel: false, //(thread-loader: https://github.com/webpack-contrib/thread-loader)
    watch: ["config"],
    babel: {
      plugins: ["transform-decorators-legacy", "transform-class-properties"]
    },
    extend(config) {
      const $colors = coerce(colors.default || colors);
      const $theme = coerce(theme);
      // Customize stylus loader

      const stylusRules = config.module.rules.find(
        rule => rule.test.toString().indexOf("styl") > -1
      );
      if (stylusRules && Array.isArray(stylusRules.oneOf)) {
        stylusRules.oneOf.forEach(one => {
          if (Array.isArray(one.use)) {
            one.use.forEach(u => {
              if (u.loader == "stylus-loader") {
                const stylusOptions = u.options;
                //Define your options here (stylusOptions.use, stylusOptions.import, ...)
                //e.g. add a plugin:
                const uses = (stylusOptions.use = stylusOptions.use || []);
                uses.push(function (style) {
                  style.define("colors", $colors, true);
                  style.define("theme", $theme, true);
                });
              }
            });
          }
        });
      }
    }
  }
};

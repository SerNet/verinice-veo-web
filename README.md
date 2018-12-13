# veo-web

> verinice.veo

## Build Setup

```bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

## Vuex Environment

Vuex is used in [Nuxt.js Vuex Modules Mode](https://nuxtjs.org/guide/vuex-store#modules-mode).
That means every module resides in a separate file/directory. Every module exports a constant called `helpers` which makes mapState, mapGetters, mapMutations and mapActions
available in a type-safe matter. Additionally, for type-safety purposes, the helpers object contains the methods dispatch, commit and the property getters which are bound
to the according namespace.

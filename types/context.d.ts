import '@nuxt/types'
import VueI18n from 'vue-i18n'

import { API } from '~/plugins/api'
import { Auth } from '~/plugins/auth'

declare module 'vue/types/vue' {
  interface Vue {
    $api: API
    $auth: Auth
  }
}

declare module '@nuxt/types/app' {
  interface NuxtAppOptions {
    $api: API
    $auth: Auth
  }
}

declare module '@nuxt/types' {
  interface Context {
    $api: API
    $auth: Auth
    $t: VueI18n.prototype.t // Composition api workaround
  }
}

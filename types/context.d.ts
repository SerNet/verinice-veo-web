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

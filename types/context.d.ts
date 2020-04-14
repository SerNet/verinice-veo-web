import { API } from '~/plugins/api'
import { Auth } from '~/plugins/auth'
import { Navigation } from '~/plugins/navigation'

declare module 'vue/types/vue' {
  interface Vue {
    $api: API
    $auth: Auth
    $navigation: Navigation
  }
}

declare module '@nuxt/types/app' {
  interface NuxtAppOptions {
    $api: API
    $auth: Auth
    $navigation: Navigation
  }
}

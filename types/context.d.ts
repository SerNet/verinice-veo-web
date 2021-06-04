import '@nuxt/types';
import VueI18n from 'vue-i18n';

import { API } from '~/plugins/api';
import { User } from '~/plugins/user';

declare module 'vue/types/vue' {
  interface Vue {
    $api: API;
    $user: User;
  }
}

declare module '@nuxt/types/app' {
  interface NuxtAppOptions {
    $api: API;
    $user: User;
  }
}

declare module '@nuxt/types' {
  interface Context {
    $api: API;
    $user: User;
    $t: VueI18n.prototype.t; // Composition api workaround
  }
}

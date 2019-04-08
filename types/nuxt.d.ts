import Vue from "vue";
import { Store } from "vuex";
import VueRouter, { Route } from "vue-router";

import { Context as NuxtContext } from "@nuxt/vue-app/types";
import { EventEmitter } from "events";

import { NuxtApp } from "@nuxt/vue-app";
import { VuetifyObject } from "vuetify/types";

declare global {
  interface Window {
    $nuxt: NuxtApp;
  }

  interface NodeModule {
    resource: string;
  }
}

declare module "vue/types/options" {
  type PropertyMap = { [key: string]: string };

  interface NuxtTransition {
    name?: string;
    mode?: string;
    css?: boolean;
    duration?: number;
    type?: string;
    enterClass?: string;
    enterToClass?: string;
    enterActiveClass?: string;
    leaveClass?: string;
    leaveToClass?: string;
    leaveActiveClass?: string;
  }

  interface RedirectFunction {
    (status: number, path: string, query?: PropertyMap): void;
    (path: string, query?: PropertyMap): void;
    (...args: any[]): void;
  }
}

export interface Context<S = any> extends NuxtContext {
  app: Vue & { router: VueRouter };
}

export type InjectFunction = (name: string, obj: any) => void;

declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

declare module "vue/types/vue" {
  // 3. Declare augmentation for Vue
  interface Vue {
    $cookies: any;
    $store: Store<any>;
  }
}

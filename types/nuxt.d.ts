import Vue from "vue";
import { Store } from "vuex";
import VueRouter, { Route } from "vue-router";
import { AxiosInstance } from "axios";
import VueI18n, { IVueI18n } from "vue-i18n";
import { EventEmitter } from "events";

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

  type NuxtContext<S = any> = {
    app: Vue & { router: VueRouter };
    isClient: boolean;
    isServer: boolean;
    isStatic: boolean;
    isDev: boolean;
    isHMR: boolean;
    route: Route;
    store: Store<S>;
    $store: Store<S>;
    env: PropertyMap;
    params: PropertyMap;
    query: PropertyMap;
    req: Request;
    res: Response;
    redirect: RedirectFunction;
    error: (params: { statusCode: number; message: string }) => void;
    nuxtState: Object;
    beforeNuxtRender: (fn: (params: { Components: PropertyMap; nuxtState: PropertyMap }) => any) => void;
  };

  export interface ComponentOptions<V extends Vue> {
    fetch?<S = any>(context: NuxtContext<S>): Promise<any>;
    asyncData?<S = any>(context: NuxtContext<S>): Promise<any>;
    head?(): Object;
    layout?: "default" | string;
    middleware?: string[] | string;
    scrollToTop?: boolean;
    transition?: string | NuxtTransition | ((to: Route, from: Route) => string);
    validate?<S = any>(context: NuxtContext<S>): boolean | Promise<boolean>;
    watchQuery?: Array<string>;
  }
}

declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

declare module "vue/types/vue" {
  // 3. Declare augmentation for Vue
  interface Vue {
    $axios: AxiosInstance;
    $cookies: any;
    $store: Store<any>;
    readonly i18n: VueI18n & IVueI18n;
    readonly $i18n: VueI18n & IVueI18n;
    $i18nError(error: Error): string;
    $t: typeof VueI18n.prototype.t;
    $tc: typeof VueI18n.prototype.tc;
    $te: typeof VueI18n.prototype.te;
    $d: typeof VueI18n.prototype.d;
    $n: typeof VueI18n.prototype.n;
  }
}

declare module "vuex/types/index" {
  export type ActionHandler<S, R> = (
    this: Vue & { $axios: AxiosInstance },
    injectee: ActionContext<S, R>,
    payload: any
  ) => any;
  export interface ActionObject<S, R> {
    root?: boolean;
    handler: ActionHandler<S, R>;
  }
  export interface ActionTree<S, R> {
    [key: string]: Action<S, R>;
  }
}

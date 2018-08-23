import Vue from "vue";
import { Store } from "vuex";
import { Route } from "vue-router";

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

  type NuxtContext<S> = {
    app: Vue;
    isClient: boolean;
    isServer: boolean;
    isStatic: boolean;
    isDev: boolean;
    isHMR: boolean;
    route: Route;
    store: Store<S>;
    env: PropertyMap;
    params: PropertyMap;
    query: PropertyMap;
    req: Request;
    res: Response;
    redirect: (status: number, path: string, query: PropertyMap) => void;
    error: (params: { statusCode: number; message: string }) => void;
    nuxtState: Object;
    beforeNuxtRender: (
      fn: (params: { Components: PropertyMap; nuxtState: PropertyMap }) => any
    ) => void;
  };

  export interface ComponentOptions<V extends Vue> {
    fetch?<S = any>(context: NuxtContext<S>): Promise<any>;
    asyncData?<S = any>(context: NuxtContext<S>): Promise<any>;
    head?(): Object;
    layout?: "default" | string;
    middleware?: string[] | string;
    scrollToTop?: boolean;
    transition?: string | NuxtTransition | ((to: Route, from: Route) => string);
    validate?<S = any>(context: NuxtContext<S>): boolean;
    watchQuery?: Array<string>;
  }
}

declare module "*.vue" {
  import Vue from "vue";
  export default Vue;
}

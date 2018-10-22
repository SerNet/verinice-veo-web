import Vue from "vue";
import Vuex, { Store, Dispatch, Commit, Module } from "vuex";
import auth from "./modules/auth";
import nav from "./modules/nav";
import tree from "./modules/tree";
import elements from "./modules/elements";
import schema from "./modules/schema";
import form from "./modules/form";
import error from "./modules/error";
import { StrictStore, strictModules } from "./helpers/StrictStore";

Vue.use(Vuex);

const state = {
  version: "1.0.0",
  errors: []
};
export type RootState = typeof state;

const modules: any = {
  auth,
  nav,
  schema,
  tree,
  elements,
  form,
  error
};

export interface RootActions {
  init: {};
}

export default () => {
  const root: StrictStore<RootState, typeof modules> = new Vuex.Store<
    RootState
  >({
    modules,
    strict: process.env.NODE_ENV !== "production",
    plugins: [strictModules],
    actions: {
      async nuxtServerInit(this: Vue, context, { route, req }) {
        if (req && req.url && req.url.indexOf(".") > -1) return;
        route["TEXT"] = { asdf: 1 };
        await context.dispatch("auth/init");
        await context.dispatch("init");
      },
      async init(this: Vue, { dispatch }) {
        await dispatch("schema/init");
        await dispatch("elements/init");
      }
    }
  });

  return root;
};

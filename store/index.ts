import Vue from "vue";
import Vuex, { Store, Dispatch, Commit, Module } from "vuex";
import auth from "./modules/auth";
import nav from "./modules/nav";
import tree from "./modules/tree";
import form from "./modules/form";
import { DefineModule, StrictCommit, StrictDispatch } from "../types/vuex";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

const state = {
  version: "1.0.0"
};
export type RootState = typeof state;

const modules: any = {
  auth,
  nav,
  tree,
  form
};

type ModuleMap<State, Getters, Mutations, Actions> = {
  [name: string]: DefineModule<State, Getters, Mutations, Actions>;
};

type ModuleContextMap<
  State,
  Getters,
  Mutations,
  Actions,
  M extends ModuleMap<State, Getters, Mutations, Actions>
> = {
  [K in keyof M]: {
    commit: StrictCommit<Mutations, never>;
    dispatch: StrictDispatch<Actions, never>;
  }
};

interface StrictStore<
  S,
  M extends ModuleMap<State, Getters, Mutations, Actions>,
  State = any,
  Getters = any,
  Mutations = any,
  Actions = any
> extends Store<S, M> {
  modules: ModuleContextMap<State, Getters, Mutations, Actions, M>;
}

declare module "vuex" {
  interface Store<S, M = any> {
    modules: any;
  }
}

function strictModules(s: any) {
  const map = s._modulesNamespaceMap;
  const modules = (s["modules"] = {});

  function createBoundStore(k: string) {
    return {
      commit: function(path: string, ...args: any[]) {
        return s.commit(k + path, ...args);
      },
      dispatch: function(path: string, ...args: any[]) {
        return s.dispatch(k + path, ...args);
      }
    };
  }

  for (const k in map) {
    let outer = modules;
    const path = k.split("/");
    for (let i = 0; i < path.length - 2; i++) {
      outer = outer[path[i]] = {};
    }
    outer[path[path.length - 2]] = createBoundStore(k);
  }
}

export default () => {
  const root: StrictStore<RootState, typeof modules> = new Vuex.Store<
    RootState
  >({
    modules,
    strict: debug,
    plugins: [strictModules],
    actions: {
      async nuxtServerInit(context) {
        await context.dispatch("auth/init");
        await context.dispatch("tree/init");
      }
    }
  });

  return root;
};

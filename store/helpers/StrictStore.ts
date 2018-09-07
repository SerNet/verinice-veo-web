import Vuex, { Store, Dispatch, Commit, Module } from "vuex";
import { DefineModule, StrictCommit, StrictDispatch } from "../../types/vuex";

export type ModuleMap<State, Getters, Mutations, Actions> = {
  [name: string]: DefineModule<State, Getters, Mutations, Actions>;
};

export type ModuleContextMap<
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

export interface StrictStore<
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

export function strictModules(s: any) {
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

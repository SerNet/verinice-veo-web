import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";
import { NuxtContext } from "vue/types/options";
import { helpers as auth } from "~/store/auth";

export interface RootState {
  version: string;
  errors: any[];
}

export interface RootGetters {}

export interface RootMutations {}

export const state = () => ({ version: "1.0.0", errors: [] } as RootState);

export interface RootActions {
  nuxtServerInit: NuxtContext<any>;
  init: {};
}

export const actions: DefineActions<RootActions, RootState, RootMutations, RootActions> = {
  async nuxtServerInit({ dispatch }, { route, req }) {
    if (req && req.url && req.url.indexOf(".") > -1) return;
    try {
      await dispatch("auth/init" as any);
      await dispatch("init", {});
    } catch (e) {
      console.error(e);
    }
  },
  async init({ getters, dispatch }) {
    if (getters["auth/isAuthorized"]) {
      //await dispatch("schema/init");
      await dispatch("elements/init");
    }
  }
};

export namespace RootDefined {
  export type Getters<Getters, State, ExtraGetters = {}> = DefineGetters<
    Getters,
    State,
    ExtraGetters,
    RootState,
    RootGetters
  >;

  export type Actions<Actions, State, Getters, Mutations, ExtraActions = {}> = DefineActions<
    Actions,
    State,
    Getters,
    Mutations,
    ExtraActions,
    RootState,
    RootGetters,
    RootMutations,
    RootActions
  >;
}

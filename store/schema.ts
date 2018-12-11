import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";

export interface State {
  schemaNames: string[];
}

export const state = () => ({ schemaNames: [] } as State);
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Getters {}
export const getters: RootDefined.Getters<Getters, State> = {};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {
  setSchemaNames: string[];
}
export const mutations: DefineMutations<Mutations, State> = {
  setSchemaNames(state, value) {
    state.schemaNames = value
      .map(val =>
        val
          .split(".")
          .slice(0, -1)
          .join(".")
      )
      .sort();
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Actions {
  init: {};
  fetch: {};
}
export const actions: RootDefined.Actions<Actions, State, Getters, Mutations> = {
  async init({ state, dispatch, commit }, payload) {
    await dispatch("fetch", {});
  },
  async fetch({ commit, dispatch }, payload) {
    try {
      const response: any[] = await this.$axios.$get("/api/schemas");
      commit("setSchemaNames", response);
    } catch (e) {
      commit("setSchemaNames", []);
    }
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>("schema");

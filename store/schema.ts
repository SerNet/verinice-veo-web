import { createNamespacedHelpers, MutationTree, GetterTree, ActionTree } from "vuex";
import { RootState } from "~/store/index";

export interface State {
  schemaNames: string[];
}

export const state = () => ({ schemaNames: [] } as State);

export const getters: GetterTree<State, RootState> = {};

export const mutations: MutationTree<State> = {
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

export const actions: ActionTree<State, RootState> = {
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

export const helpers = createNamespacedHelpers("schema");

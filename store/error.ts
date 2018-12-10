import { createNamespacedHelpers, MutationTree, GetterTree, ActionTree } from "vuex";
import { RootState } from "~/store/index";

export interface State {
  items: string[];
}

export const state = () => ({ items: [] } as State);

export const getters: GetterTree<State, RootState> = {};

export const mutations: MutationTree<State> = {
  addError(state, value) {
    state.items.push(value);
  }
};

export const actions: ActionTree<State, RootState> = {
  async handle({ commit }, error) {
    commit("addError", error.message);
  }
};

export const helpers = createNamespacedHelpers("error");

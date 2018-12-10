import { createNamespacedHelpers, MutationTree, GetterTree, ActionTree } from "vuex";

export interface RootState {
  version: string;
  errors: any[];
}

export const state = () => ({ version: "1.0.0", errors: [] } as RootState);

export const actions: ActionTree<RootState, RootState> = {
  async nuxtServerInit({ dispatch }, { route, req }) {
    if (req && req.url && req.url.indexOf(".") > -1) return;
    try {
      await dispatch("auth/init");
      await dispatch("init");
    } catch (e) {
      console.error(e);
    }
  },

  async init({ getters, dispatch }) {
    if (getters["auth/isAuthorized"]) {
      await dispatch("schema/init");
      await dispatch("elements/init");
    }
  }
};

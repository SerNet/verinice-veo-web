import Vue from "vue";
import { RootState } from "~/store/index";
import { Module } from "vuex";

const state = {
  items: (<any>undefined) as TreeItem[],
  current_id: "" as string | null
};

const ID_FIELD = "$veo.id";
const PARENT_FIELD = "parent";

export interface TreeItem {
  [ID_FIELD]: string;
  [PARENT_FIELD]: string;
  schema: string;
  title: string;
}

export type TreeState = typeof state;

const module: Module<TreeState, RootState> = {
  namespaced: true,
  state,
  mutations: {
    setActive(state, value: string) {
      state.current_id = value || null;
    },
    setItems(state, value: TreeItem[]) {
      state.items = value;
    }
  },
  getters: {
    items: state =>
      state.items.filter(
        item => item[PARENT_FIELD] === state.current_id || null
      ),
    breadcrumbById: state => (id: string) => {
      const path = [id];
      let parent: string | undefined = id;
      while (parent) {
        const node = state.items.find(item => item[ID_FIELD] == parent);
        parent = node && node[PARENT_FIELD];
        if (parent) path.unshift(parent);
      }
      return path;
    }
  },
  actions: {
    async init(this: Vue, { state, commit }) {
      commit("setItems", null);
    },
    async getItems(this: Vue, { state, commit }, { id } = {}) {
      commit("setActive", id);
      if (state.items) return;
      const response = await this.$axios.$get("/api/elements");

      commit("setItems", response);
    }
  }
};

export default module;

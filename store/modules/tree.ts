import Vue from "vue";
import { RootState } from "~/store/index";
import { Module } from "vuex";

const ID_FIELD = "$veo.id";
const PARENT_FIELD = "parent";
const TITLE_FIELD = "$veo.title";

export interface TreeItem {
  [ID_FIELD]: string;
  [PARENT_FIELD]: string;
  [TITLE_FIELD]: string;
  schema: string;
  title: string;
}

export interface ItemMeta {
  expanded: boolean;
}

export class InternalTreeItem {
  id: string;
  parent: string;
  title: string;

  constructor(data: TreeItem) {
    this.id = data[ID_FIELD];
    this.parent = data[PARENT_FIELD];
    this.title = data[TITLE_FIELD];
  }
}

const state = {
  items: (<any>undefined) as TreeItem[],
  current_id: "" as string | null,
  meta: {} as { [id: string]: ItemMeta }
};

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
    },
    setMeta(state, { id, meta }: { id: string; meta: Partial<ItemMeta> }) {
      Vue.set(state.meta, id, { ...(state.meta[id] || {}), ...meta });
    }
  },
  getters: {
    root: state => {
      const root =
        state.items && state.items.find(item => item.parent === null);
      return root && new InternalTreeItem(root);
    },
    meta: state => (node: InternalTreeItem) => {
      return state.meta[node && node.id] || {};
    },
    hasChildren: state => (node: InternalTreeItem) => {
      return node && !!state.items.find(item => item.parent === node.id);
    },
    isExpanded: state => (node: InternalTreeItem) => {
      const meta = state.meta[node && node.id];
      return meta && meta.expanded;
    },

    children: state => (node: InternalTreeItem) => {
      return (
        node &&
        state.items
          .filter(item => item.parent === node.id)
          .map(item => new InternalTreeItem(item))
      );
    },
    items: state =>
      state.items &&
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

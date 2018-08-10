import Vue from 'vue';
import { RootState } from '~/store/index'
import { Module } from 'vuex';

const state = {
  items: <any>undefined as TreeItem[]
}

export interface TreeItem {
  id: string,
  parent: string,
  schema: string,
  title: string
}

export type TreeState = typeof state;

const module: Module<TreeState, RootState> = {
  namespaced: true,
  state,
  mutations: {
    setItems(state, value: TreeItem[]) {
      state.items = value;
    }
  },
  getters: {
    items: (state) => state.items.filter(item => !item.parent),
    breadcrumbById: (state) => (id: string) => {
      const path = [id];
      let parent: string | undefined = id;
      while (parent) {
        const node = state.items.find(item => item.id == parent);
        parent = node && node.parent;
        if (parent) path.unshift(parent);
      }
      return path;
    }
  },
  actions: {
    async getItems(this: Vue, { state, commit }) {
      if (state.items) return;
      const response = await this.$axios.$get('/api/elements');
      commit('setItems', response);
    }
  }
};

export default module;

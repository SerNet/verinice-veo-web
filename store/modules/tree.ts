import Vue from 'vue';
import {RootState} from '~/store/index'
import { Module } from 'vuex';

const state = {
  items: [] as any[]
}

export type TreeState = typeof state;

const module: Module<TreeState, RootState> = {
  namespaced: true,
  state,
  mutations: {
    setItems(state, value: any[]) {
      state.items = value;
    }
  },
  getters: {
    items: (state) => state.items
  },
  actions: {
    async getItems(this: Vue, {commit}) {
      const response = await this.$axios.get('/api/elements/aac77d09-15e2-41ed-9faf-2cbc98ee3b51');
      commit('setItems', response.data.properties);
    }
  }
};

export default module;
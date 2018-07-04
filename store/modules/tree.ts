import Vue from 'vue';
import {RootState} from '~/store/index'
import { Module } from 'vuex';

const state = {
  items: undefined as undefined|any[]
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
    async getItems(this: Vue, {state, commit}) {
      if(state.items) return;
      const response = await this.$axios.$get('/api/elements');
      commit('setItems', response);
    }
  }
};

export default module;
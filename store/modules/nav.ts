import Vue from 'vue';
import { RootState } from '~/store/index'
import { Module } from 'vuex';

export interface NavItem {
  active: boolean,
  icon: string,
  title: string
}

const state = {
  items: [{
    active: true,
    icon: 'folder',
    title: 'Beispieleintrag I',
  },
  {
    active: false,
    icon: 'settings',
    title: 'Einstellungen',
  }] as NavItem[]
}

export type NavState = typeof state;

const module: Module<NavState, RootState> = {
  namespaced: true,
  state,
  mutations: {
    setItems(state, value) {
      state.items = value;
    }
  }
};

export default module;

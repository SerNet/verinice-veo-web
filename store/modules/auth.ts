import Vue from 'vue';
import {RootState} from '~/store/index'
import { Module } from 'vuex';
import { AxiosError } from 'axios';
import VeoError from '~/models/VeoError';

const state = {
  token: null
}

export type AuthState = typeof state;

const module: Module<AuthState, RootState> = {
  namespaced: true,
  state,
  mutations: {
    setItems(state, value: any) {
      state.token = value;
      
    }
  },
  getters: {
    items: (state: any) => state.items
  },
  actions: {
    async init({dispatch}, payload) {
      return await dispatch('login');
    },
    async login(this: Vue, {state, rootState}, payload: {username: string, password: string}) {
      try {
        const repsonse = await this.$axios.post('/api/login', payload);
      } catch(e) {
        if(e.response) {
          const {response} = e as AxiosError;
          throw new VeoError('Login fehlgeschlagen');
        }
        throw e;
      }
    }
  }
};

export default module;
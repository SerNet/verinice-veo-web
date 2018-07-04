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
    setToken(state, value: any) {
      state.token = value;
    }
  },
  getters: {
    authorizationHeader: (state: any) => state.token
  },
  actions: {
    async init({state, dispatch}, payload) {
      if(!state.token)
      return await dispatch('login', {username: 'admin', password: 'password'});
    },
    async login(this: Vue, {commit}, payload: {username: string, password: string}) {
      try {
        const response = await this.$axios.post('/api/login', payload);
        commit('setToken', response.headers['authorization']);
      } catch(e) {
        if(e.response) {
          const {response} = e as AxiosError;
          throw new this.$error('AUTH_LOGIN_FAILED', {status: response!.status, cause: e});
        }
        throw e;
      }
    }
  }
};

export default module;
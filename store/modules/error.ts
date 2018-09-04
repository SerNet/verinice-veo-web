import Vue from "vue";
import { RootState } from "~/store/index";
import { Module } from "vuex";
import { AxiosError } from "axios";
import jsonwebtoken from "jsonwebtoken";
import { DefineModule, createNamespacedHelpers } from "vuex";

export interface State {
  errors: string[];
}

export interface Getters {}

export interface Mutations {
  addError: string;
}

export interface Actions {
  handle: Error;
}

const module: DefineModule<State, Getters, Mutations, Actions> = {
  namespaced: true,
  state: {
    errors: []
  },
  mutations: {
    addError(state, value) {
      state.errors.push(value);
    }
  },
  getters: {},
  actions: {
    async handle(this: Vue, { commit }, error) {
      commit("addError", error.message);
    }
  }
};

export const helpers = createNamespacedHelpers<
  State,
  Getters,
  Mutations,
  Actions
>("error");

export default module;

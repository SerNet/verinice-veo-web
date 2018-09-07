import Vue from "vue";
import { RootState, RootActions } from "~/store/index";
import { Module } from "vuex";
import { AxiosError } from "axios";
import jsonwebtoken from "jsonwebtoken";
import { DefineModule, createNamespacedHelpers } from "vuex";

export interface State {
  schemaNames: string[];
}

export interface Getters {}

export interface Mutations {
  setSchemaNames: string[];
}

export interface Actions {
  init: {};
  fetch: {};
}

const module: DefineModule<
  State,
  Getters,
  Mutations,
  Actions,
  {},
  {},
  {},
  {},
  {},
  {},
  RootActions
> = {
  namespaced: true,
  state: {
    schemaNames: []
  },
  mutations: {
    setSchemaNames(state, value) {
      state.schemaNames = value
        .map(val =>
          val
            .split(".")
            .slice(0, -1)
            .join(".")
        )
        .sort();
    }
  },
  getters: {},
  actions: {
    async init({ state, dispatch, commit }, payload) {
      await dispatch("fetch", {});
    },
    async fetch(this: Vue, { commit, dispatch }, payload) {
      const response: any[] = await this.$axios.$get("/api/schemas");
      commit("setSchemaNames", response);
    }
  }
};

export const helpers = createNamespacedHelpers<
  State,
  Getters,
  Mutations,
  Actions
>("schema");

export default module;

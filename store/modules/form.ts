import Vue from "vue";
import { RootState } from "~/store/index";
import { Module } from "vuex";
import { AxiosError } from "axios";

const state = {
  model: {},
  schema: {},
  breadcrumb: []
};

export type FormState = typeof state;

const module: Module<FormState, RootState> = {
  namespaced: true,
  state,
  mutations: {
    setModel(state, value: {}) {
      state.model = value;
    },
    setSchema(state, value: {}) {
      state.model = value;
    },
    setBreadcrumb(state, value) {
      state.breadcrumb = value;
    }
  },
  actions: {
    async load(this: Vue, { state, rootState, rootGetters, commit }, { id }) {
      try {
        const response = await this.$axios.$get(`/api/elements/${id}`);
        commit("setModel", response);
        commit("setBreadcrumb", rootGetters['tree/breadcrumbById'](id))
      } catch (e) {
        if (e.response) {
          const { response } = e as AxiosError;
          throw new this.$error("FORM_GET_ELEMENT_FAILED", {
            id: id,
            status: response!.status,
            cause: e
          });
        }
        throw e;
      }
    }
  }
};

export default module;

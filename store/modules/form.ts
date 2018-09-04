import Vue from "vue";
import { RootState } from "~/store/index";
import { Module } from "vuex";
import { AxiosError } from "axios";
import { DefineModule, createNamespacedHelpers } from "vuex";

const state = {
  model: {},
  schema: {},
  schemaCache: {},
  breadcrumb: []
};

const SCHEMA_FIELD = "$veo.type";

export type FormState = typeof state;

const module: Module<FormState, RootState> = {
  namespaced: true,
  state,
  getters: {
    schemaByName: state => (name: string) => state.schemaCache[name]
  },
  mutations: {
    setModel(state, value: {}) {
      state.model = value;
    },
    setSchema(state, value: {}) {
      state.schema = value;
    },
    addSchema(state, { name, value }) {
      state.schemaCache[name] = value;
    },
    setBreadcrumb(state, value) {
      state.breadcrumb = value;
    }
  },
  actions: {
    async load(this: Vue, { dispatch, rootGetters, commit }, { id }) {
      try {
        const response = await this.$axios.$get(`/api/elements/${id}`);
        commit("setModel", response);
        if (response[SCHEMA_FIELD]) {
          await dispatch("loadSchema", { name: response[SCHEMA_FIELD] });
        }
        commit("setBreadcrumb", rootGetters["tree/breadcrumbById"](id));
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
    },
    /**
     * Retrieve a schema from the web service
     */
    async loadSchema(this: Vue, { commit, getters }, { name }) {
      try {
        const existing = getters.schemaByName(name);
        if (existing) {
          commit("setSchema", existing);
          return existing;
        }
        const schema = await this.$axios.$get(`/api/schemas/${name}.json`);
        commit("setSchema", schema);
        commit("addSchema", { name: name, value: schema });
      } catch (e) {
        if (e.response) {
          const { response } = e as AxiosError;
          throw new this.$error("FORM_GET_SCHEMA_FAILED", {
            name: name,
            status: response!.status,
            cause: e
          });
        }
        throw e;
      }
    }
  }
};

export const helpers = createNamespacedHelpers("form");

export default module;

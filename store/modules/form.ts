import Vue from "vue";
import { RootState } from "~/store/index";
import { Module } from "vuex";
import { AxiosError } from "axios";
import { DefineModule, createNamespacedHelpers } from "vuex";
import { ID_FIELD, TITLE_FIELD, PARENT_FIELD, TYPE_FIELD } from "~/config/api";
import { TreeItem } from "~/models/TreeItem";
import { VeoItem, VeoLink } from "api";
import Catch from "~/lib/CatchDecorator";
import HTTPError from "~/exceptions/HTTPError";

const state = {
  model: {},
  links: [] as VeoLink[],
  schema: {},
  schemaCache: {}
};

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
    setLinks(state, value: []) {
      state.links = value;
    },
    setSchema(state, value: {}) {
      state.schema = value;
    },
    addSchema(state, { name, value }) {
      state.schemaCache[name] = value;
    }
  },
  actions: {
    async create(this: Vue, { dispatch, rootGetters, commit }, { type, parent }) {
      try {
        const title = "Neues Element";
        const response: VeoItem = {
          [TITLE_FIELD]: title,
          [PARENT_FIELD]: parent,
          [TYPE_FIELD]: type
        };
        commit("setModel", response);
        if (response[TYPE_FIELD]) {
          await dispatch("loadSchema", { name: response[TYPE_FIELD] });
        }
      } catch (e) {
        throw e;
      }
    },
    async load(this: Vue, { dispatch, rootGetters, commit }, { id }) {
      const model = await dispatch("loadElement", { id });
      if (model[TYPE_FIELD]) await dispatch("loadSchema", { name: model[TYPE_FIELD] });
    },

    async loadElement(this: Vue, { dispatch, rootGetters, commit }, { id }) {
      const response = await this.$axios.$get(`/api/elements/${id}`).catch(e => {
        throw new HTTPError("FORM_GET_ELEMENT_FAILED", { id }, e);
      });
      commit("setModel", response);
      return response;
    },
    async loadLinks(this: Vue, { dispatch, rootGetters, commit }, { id }) {
      const response = await this.$axios.$get(`/api/elements/${id}/links`);
      commit("setLinks", response);
    },
    /**
     * Retrieve a schema from the web service
     */
    async loadSchema(this: Vue, { commit, getters }, { name }) {
      const existing = getters.schemaByName(name);
      if (existing) {
        commit("setSchema", existing);
        return existing;
      }
      const schema = await this.$axios.$get(`/api/schemas/${name}.json`).catch(e => {
        throw new HTTPError("FORM_GET_SCHEMA_FAILED", { name }, e);
      });
      commit("setSchema", schema);
      commit("addSchema", { name: name, value: schema });
    },
    async save(this: Vue, { dispatch, rootGetters, commit }, payload) {
      let id = payload[ID_FIELD];

      if (id) {
        await this.$axios.$put(`/api/elements/${id}`, payload).catch(e => {
          throw new HTTPError("FORM_SAVE_ELEMENT_FAILED", { id }, e);
        });
      } else {
        const response = await this.$axios.post(`/api/elements`, payload).catch(e => {
          throw new HTTPError("FORM_SAVE_ELEMENT_FAILED", e);
        });
        const location = response.headers.location || "";
        id = location.split("/").pop();
      }

      await dispatch("tree/init", {}, { root: true });
      id && (await dispatch("load", { id }));
      return id;
    }
  }
};

export const helpers = createNamespacedHelpers("form");

export default module;

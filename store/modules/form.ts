import Vue from "vue";
import { RootState } from "~/store/index";
import { Module } from "vuex";
import { AxiosError } from "axios";
import { DefineModule, createNamespacedHelpers } from "vuex";
import { ID_FIELD, TITLE_FIELD, PARENT_FIELD, TYPE_FIELD } from "~/config/api";
import { TreeItem } from "~/models/TreeItem";
import { VeoItem } from "api";

const state = {
  model: {},
  schema: {},
  schemaCache: {},
  breadcrumb: [] as TreeItem[]
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
    setSchema(state, value: {}) {
      state.schema = value;
    },
    addSchema(state, { name, value }) {
      state.schemaCache[name] = value;
    },
    setBreadcrumb(state, value: any[]) {
      state.breadcrumb = value.map(x => new TreeItem(x));
    }
  },
  actions: {
    async create(
      this: Vue,
      { dispatch, rootGetters, commit },
      { type, parent }
    ) {
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
        commit(
          "setBreadcrumb",
          rootGetters["tree/breadcrumb"](parent).concat(response)
        );
      } catch (e) {
        throw e;
      }
    },
    async load(this: Vue, { dispatch, rootGetters, commit }, { id }) {
      try {
        const response = await this.$axios.$get(`/api/elements/${id}`);
        commit("setModel", response);
        if (response[TYPE_FIELD]) {
          await dispatch("loadSchema", { name: response[TYPE_FIELD] });
        }
        commit("setBreadcrumb", rootGetters["tree/breadcrumb"](id));
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
    async save(this: Vue, { dispatch, rootGetters, commit }, payload) {
      let id = payload[ID_FIELD];
      try {
        if (id) {
          await this.$axios.$put(`/api/elements/${id}`, payload);
        } else {
          const response = await this.$axios.post(`/api/elements`, payload);
          const location = response.headers.location || "";
          id = location.split("/").pop();
        }

        await dispatch("tree/init", {}, { root: true });
        id && (await dispatch("load", { id }));
        return id;
      } catch (e) {
        if (e.response) {
          const { response } = e as AxiosError;
          throw new this.$error("FORM_SAVE_ELEMENT_FAILED", {
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

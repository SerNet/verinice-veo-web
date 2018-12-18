import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";
import { ApiSchema } from "~/types/api";
import HTTPError from "~/exceptions/HTTPError";
import Vue from "vue";

export interface State {
  items: string[];
  schemas: Record<string, ApiSchema>;
}

export const state = () => ({ items: [], schemas: {} } as State);
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Getters {
  index: Record<string, ApiSchema>;
  items: ApiSchema[];
}
export const getters: RootDefined.Getters<Getters, State> = {
  index(state) {
    return state.schemas;
  },
  items(state) {
    return state.items.map(name => state.schemas[name]);
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {
  setItems: string[];
  setSchema: { name: string; schema: ApiSchema };
}

export const mutations: DefineMutations<Mutations, State> = {
  setItems(state, value) {
    state.items = value;
  },
  setSchema(state, value) {
    state.schemas[value.name] = value.schema;
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Actions {
  fetchSchema: { name: string; refresh?: boolean };
  fetchSchemas: {};
}

export const actions: RootDefined.Actions<Actions, State, Getters, Mutations> = {
  async fetchSchema({ commit, dispatch, getters }, { name, refresh }) {
    const existing = getters.index[name];
    if (existing) return existing;
    const schema: any = await this.$axios.$get(`/api/schemas/${name}.json`).catch(e => {
      throw new HTTPError("FETCH_SCHEMA_FAILED", { name }, e);
    });
    if (schema) {
      commit("setSchema", { name, schema });
      return schema;
    }
  },
  async fetchSchemas({ state, commit }, {}) {
    if (state.items.length > 0) return;
    //Fetch list of schema files
    const response: string[] = await this.$axios.$get(`/api/schemas`).catch(e => {
      throw new HTTPError("FETCH_SCHEMAS_FAILED", {}, e);
    });
    //Save name list without extension
    commit("setItems", response.map(name => String(name).replace(/\.json$/i, "")));
    return response;
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>("schemas");

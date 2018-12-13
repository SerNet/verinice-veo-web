import { VeoItem, ItemId } from "~/types/api";
import { Element, ElementMap, ElementsMap } from "~/types/app";
import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";
import { uniqueId } from "lodash";
import { helpers as parent, veoItemToElement } from "~/store/elements";

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface State {
  /**
   * Currently selected item id
   */
  data?: VeoItem;
  schema?: any;
  links?: any;
  history?: any;
}

export const state = () => ({ data: undefined, schema: undefined } as State);
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Getters {
  /**
   * Currently selected item
   */
  item?: Element;
  breadcrumb: Element[];
  schemaName?: string;
  schema?: any;
  links: [];
  history: any;
}

export const getters: RootDefined.Getters<Getters, State> = {
  item: state => (state.data ? veoItemToElement(state.data) : undefined),
  schemaName: (state, getters) => getters.item && getters.item.type,
  schema: state => {
    return state.schema;
  },
  links: state => state.links,
  history: state => state.history,
  breadcrumb: (state, getters, rootState, rootGetters) => {
    const items = rootGetters[parent.getter("items")];
    let item = getters.item;
    const path: Element[] = [];
    while (item) {
      path.unshift(item);
      const parent = item.parent;
      item = parent ? items[parent] : undefined;
    }
    return path;
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {
  setItem: VeoItem;
  setSchema: any;
  setLinks: any;
  setHistory: any;
}

export const mutations: DefineMutations<Mutations, State> = {
  setItem(state, value) {
    state.data = value;
  },
  setSchema(state, value) {
    state.schema = value;
  },
  setLinks(state, value) {
    state.links = value;
  },
  setHistory(state, value) {
    state.history = value;
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Actions {
  init: {};
  fetchItem: { id: ItemId };
  fetchLinks: { id: ItemId };
  fetchHistory: { id: ItemId };
  fetchSchema: { name: string };
}

export const actions: RootDefined.Actions<Actions, State, Getters, Mutations> = {
  async init({ dispatch }) {},
  async fetchItem({ commit, dispatch, getters }, { id }) {
    const response: VeoItem = await this.$axios.$get(`/api/elements/${id}`);
    commit("setItem", response);
    const schemaName = getters.schemaName;
    let pSchema, pLinks, pHistory;
    if (schemaName) {
      pSchema = dispatch("fetchSchema", { name: schemaName });
    }
    pLinks = dispatch("fetchLinks", { id });
    pHistory = dispatch("fetchHistory", { id });
    await Promise.all([pSchema, pLinks, pHistory]);
  },
  async fetchSchema({ commit }, { name }) {
    const response: any = await this.$axios.$get(`/api/schemas/${name}.json`);
    if (response) {
      commit("setSchema", response);
    }
  },
  async fetchLinks({ commit }, { id }) {
    const response: any = await this.$axios.$get(`/api/elements/${id}/links`);
    if (response) {
      commit("setLinks", response);
    }
  },
  async fetchHistory({ commit }, { id }) {
    const response: any = await this.$axios.$get(`/api/elements/${id}/history`);
    if (response) {
      commit("setHistory", response);
    }
  }
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>(parent.name, "active");

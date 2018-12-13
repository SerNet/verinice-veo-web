import { ApiItem, ApiLink, UUID } from "~/types/api";
import { AppElement, AppLink } from "~/types/app";
import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";
import { helpers as parent } from "~/store/elements";
import { veoItemToElement, veoLinkToLink } from "~/store/elements/utils";
import { uniq } from "lodash";
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface State {
  /**
   * Currently selected item id
   */
  data?: ApiItem;
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
  item?: AppElement;
  breadcrumb: AppElement[];
  schemaName?: string;
  schema?: any;
  links: AppLink[] | undefined;
  history: any;
  children: AppElement[];
}

export const getters: RootDefined.Getters<Getters, State> = {
  item: state => (state.data ? veoItemToElement(state.data) : undefined),
  schemaName: (state, getters) => getters.item && getters.item.type,
  schema: state => {
    return state.schema;
  },
  links: (state, getters, rootState, rootGetters) => {
    const links = state.links;
    const itemMap = rootGetters[parent.getter("items")];
    return (
      links &&
      links.map(data => {
        const item = veoLinkToLink(data);
        item.source = itemMap[item.sourceId];
        item.target = itemMap[item.targetId];
        return item;
      })
    );
  },
  history: state => state.history,
  breadcrumb: (state, getters, rootState, rootGetters) => {
    const items = rootGetters[parent.getter("items")];
    let item = getters.item;
    const path: AppElement[] = [];
    while (item) {
      path.unshift(item);
      const parent = item.parent;
      item = parent ? items[parent] : undefined;
    }
    return path;
  },
  children: (state, getters, rootState, rootGetters) => {
    const items = rootGetters[parent.getter("items")];
    const item = getters.item;
    const childMap = rootGetters[parent.getter("children")];
    const childs: UUID[] = (item && childMap[item.id]) || [];
    return childs.map(id => items[id]);
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {
  setItem: ApiItem;
  setSchema: any;
  setLinks: ApiLink[] | undefined;
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
  fetchItem: { id: UUID; refresh?: boolean };
  fetchLinks: { id: UUID };
  fetchHistory: { id: UUID };
  fetchSchema: { name: string };
  save: ApiItem;
}

export const actions: RootDefined.Actions<Actions, State, Getters, Mutations> = {
  async init({ dispatch }) {},
  async fetchItem({ commit, dispatch, getters }, { id, refresh }) {
    const item = await dispatch(parent.action("fetchItem"), { id, refresh }, { root: true });
    const response: ApiItem = item.data;
    commit("setItem", response);
    commit("setLinks", undefined);
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
  async fetchLinks({ commit, getters, dispatch }, { id }) {
    const response: any = await this.$axios.$get(`/api/elements/${id}/links`);
    if (response) {
      commit("setLinks", response);
      const links = getters.links;
      if (links) {
        const FETCH_ITEMS = parent.action("fetchItems");
        const ids = links.reduce(
          (out, link) => {
            out.push(link.sourceId);
            out.push(link.targetId);
            return out;
          },
          [] as UUID[]
        );
        await dispatch(FETCH_ITEMS, { id: uniq(ids) }, { root: true });
      }
    }
  },
  async fetchHistory({ commit }, { id }) {
    const response: any = await this.$axios.$get(`/api/elements/${id}/history`);
    if (response) {
      commit("setHistory", response);
    }
  },
  async save({ commit, dispatch }, payload) {
    let id = payload[ID_FIELD];

    if (id) {
      await this.$axios.$put(`/api/elements/${id}`, payload);
    } else {
      const response = await this.$axios.post(`/api/elements`, payload);
      const location = response.headers.location || "";
      id = location.split("/").pop();
    }

    id && (await dispatch("fetchItem", { id, refresh: true }));
    return id;
  }
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>(parent.name, "active");

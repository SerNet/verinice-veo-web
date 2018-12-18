import { ApiItem, ApiLink, ApiHistory, UUID } from "~/types/api";
import { AppElement, AppHistory, AppLink } from "~/types/app";
import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";
import { helpers as parent } from "~/store/elements";
import { helpers as schemas } from "~/store/schemas";
import { veoItemToElement, veoLinkToLink } from "~/store/elements/utils";
import { uniq } from "lodash";
import HTTPError from "~/exceptions/HTTPError";
import moment from "moment";
import NumericStringComparator from "~/lib/NumericStringComparator";
import { JSONSchema6 } from "json-schema";

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface State {
  /**
   * Currently selected item id
   */
  data?: ApiItem;
  schema?: JSONSchema6;
  links: ApiLink[];
  history: ApiHistory[];
}

export const state = () => ({ data: undefined, schema: undefined, errors: [], links: [], history: [] } as State);
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Getters {
  /**
   * Currently selected item
   */
  item?: AppElement;
  breadcrumb: AppElement[];
  schemaName?: string;
  schema: JSONSchema6 | null | undefined;
  links: AppLink[] | undefined;
  history?: AppHistory[] | undefined;
  children: AppElement[];
}

export const getters: RootDefined.Getters<Getters, State> = {
  item: state => (state.data ? veoItemToElement(state.data) : undefined),
  schemaName: (state, getters) => getters.item && getters.item.type,
  schema: state => {
    return state.schema;
  },
  links: (state, getters, rootState, rootGetters) => {
    const comparator = new NumericStringComparator();
    const links = state.links;
    const itemMap = rootGetters[parent.getter("items")];
    return (
      links &&
      links
        .map(data => {
          const item = veoLinkToLink(data);
          item.source = itemMap[item.sourceId];
          item.target = itemMap[item.targetId];
          return item;
        })
        .sort((a, b) => comparator.compare(a.source && a.source.title, b.source && b.source.title))
    );
  },
  history: state => {
    return state.history
      ? state.history
          .map(item => {
            return {
              id: moment(item.timestamp).unix(),
              author: item.author,
              timestamp: item.timestamp,
              data: item.data
            };
          })
          .sort((a, b) => b.id - a.id)
      : undefined;
  },
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
  setLinks: ApiLink[];
  setHistory: ApiHistory[];
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
    const currentItem = getters.item;
    if (currentItem && currentItem.id == id && !refresh) {
      return; //already loaded
    }
    commit("setItem", undefined);
    const item = await dispatch(parent.action("fetchItem"), { id, refresh }, { root: true });
    const response: ApiItem = item.data;
    commit("setItem", response);

    let pLinks, pHistory, pChildren;
    pLinks = dispatch("fetchLinks", { id });
    pHistory = dispatch("fetchHistory", { id });
    pChildren = dispatch(parent.action("fetchChildren"), { id }, { root: true });
    await Promise.all([pLinks, pHistory, pChildren]);
    return item;
  },
  async fetchSchema({ commit, dispatch }, { name }) {
    const schema = await dispatch(schemas.action("fetchSchema"), { name }, { root: true });
    commit("setSchema", schema);
  },
  async fetchLinks({ commit, getters, dispatch }, { id }) {
    commit("setLinks", []);
    const response: any = await this.$axios.$get(`/api/elements/${id}/links`).catch(e => {
      throw new HTTPError("FETCH_LINKS_FAILED", { id }, e);
    });
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
    const response: any = await this.$axios.$get(`/api/elements/${id}/history`).catch(e => {
      throw new HTTPError("FETCH_HISTORY_FAILED", { id }, e);
    });
    if (response) {
      commit("setHistory", response);
    }
  },
  async save({ commit, dispatch }, payload) {
    let id = payload[ID_FIELD];

    if (id) {
      await this.$axios.$put(`/api/elements/${id}`, payload).catch(e => {
        throw new HTTPError("UPDATE_ELEMENT_FAILED", { id: id || "?" }, e);
      });
    } else {
      const response = await this.$axios.post(`/api/elements`, payload).catch(e => {
        throw new HTTPError("CREATE_ELEMENT_FAILED", e);
      });
      const location = response.headers.location || "";
      id = location.split("/").pop();
    }

    id && (await dispatch("fetchItem", { id, refresh: true }));
    return id;
  }
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>(parent.name, "active");

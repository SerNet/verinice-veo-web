import { UUID, ApiItem } from "~/types/api";
import { AppElement, AppElementMap, UUIDsMap } from "~/types/app";

import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";
import { uniqueId, unionWith } from "lodash";
import { veoItemToElement } from "~/store/elements/utils";
import { helpers as active } from "./active";
import HTTPError from "~/exceptions/HTTPError";
import LocalizedError from "~/exceptions/LocalizedError";
import NumericStringComparator from "~/lib/NumericStringComparator";

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface State {
  fetchedAll: boolean;
  data: ApiItem[];
  childCount: Record<UUID, number>; //Used to detect leafs and yet loaded children
}
export const state = () => ({ data: [], childCount: {}, fetchedAll: false } as State);
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface Getters {
  items: AppElementMap;
  children: UUIDsMap;
  roots: AppElement[];
  knowsChildren: (id: UUID) => boolean;
  childCount: (id: UUID) => number;
}

export const getters: RootDefined.Getters<Getters, State> = {
  items(state, getters) {
    return state.data.map(veoItemToElement).reduce((itemMap, item) => {
      itemMap[item.id] = item;
      return itemMap;
    }, {});
  },
  children(state, getters) {
    const comparator = new NumericStringComparator();
    return state.data
      .concat()
      .sort((a, b) => comparator.compare(a[TITLE_FIELD], b[TITLE_FIELD]))
      .filter(item => item[PARENT_FIELD]) //nur Element mit Parent
      .reduce((itemMap, item) => {
        const id = item[ID_FIELD];
        const parent = item[PARENT_FIELD];
        const children = (itemMap[parent] = itemMap[parent] || []);
        children.push(id);
        itemMap[parent] = children;
        return itemMap;
      }, {});
  },
  roots(state, getters) {
    const items = getters.items;
    return state.data.filter(item => !item[PARENT_FIELD]).map(item => items[item[ID_FIELD]!]);
  },
  knowsChildren: (state, getters) => id => {
    if (state.fetchedAll) return true;
    return state.childCount[id] !== undefined;
  },
  childCount: (state, getters) => id => {
    const stateCount = state.childCount[id];
    if (stateCount !== undefined) {
      return stateCount;
    } else {
      const children = getters.children[id];
      if (children) {
        return children.length;
      }
    }
    return -1;
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {
  setData: ApiItem[];
  addData: ApiItem[];
  setChildCount: { id: UUID; count: number };
  setFetchedAll: boolean;
}

export const mutations: DefineMutations<Mutations, State> = {
  setData(state, value) {
    state.data = value;
  },
  addData(state, value) {
    state.data = state.data.concat(value);
  },
  setChildCount(state, { id, count }) {
    state.childCount[id] = count;
  },
  setFetchedAll(state, value) {
    state.fetchedAll = value;
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Actions {
  init: {};
  fetchItem: { id: UUID; refresh?: boolean };
  fetchItems: { id: UUID[]; refresh?: boolean };
  fetchAll: { refresh?: boolean };
  fetchRoots: {};
  fetchChildren: { id: UUID };
  fetchTree: { id?: UUID };
  addData: { data: ApiItem[]; refresh?: boolean };
  removeItems: UUID[];
}

export const actions: RootDefined.Actions<Actions, State, Getters, Mutations> = {
  async init({ dispatch }) {},
  async addData({ state, commit, getters }, { data, refresh }) {
    const items = getters.items;
    if (refresh) {
      const union = unionWith(data, state.data, (a, b) => a[ID_FIELD] == b[ID_FIELD]);
      commit("setData", union);
    } else {
      const uniqueData = data.filter(item => {
        const id = item[ID_FIELD];
        return id ? !items[id] : false;
      });
      commit("addData", uniqueData);
    }
  },
  /**
   * Fetch entry from Server
   */
  async fetchItem({ commit, dispatch, getters }, { id, refresh }) {
    const items = getters.items;
    if (!refresh && items[id]) {
      return items[id];
    } else {
      const response: ApiItem = await this.$axios.$get<ApiItem>(`/api/elements/${id}`).catch(e => {
        throw new LocalizedError("FETCH_ELEMENT_FAILED", { id }, e);
      });
      await dispatch("addData", { data: [response], refresh });
      return getters.items[id];
    }
  },
  /**
   * Remove entry from server
   */
  async removeItems({ commit, dispatch, getters }, ids) {
    const promises = ids.map(id =>
      this.$axios.$delete(`/api/elements/${id}`).catch(e => {
        throw new LocalizedError("REMOVE_ELEMENT_FAILED", { id }, e);
      })
    );
    await Promise.all(promises);
    await dispatch("fetchAll", { refresh: true });
  },
  /**
   * Fetch multiple entries from Server
   */
  async fetchItems({ commit, dispatch, getters }, { id, refresh }) {
    await Promise.all(id.map(id => dispatch("fetchItem", { id })));
  },
  /**
   * Fetch all nodes
   */
  async fetchAll({ state, commit, dispatch, getters }, { refresh }) {
    if (state.fetchedAll && !refresh) return;
    const response: ApiItem[] = await this.$axios.$get("/api/elements").catch(e => {
      throw new HTTPError("FETCH_ELEMENTS_FAILED", e);
    });
    commit("setFetchedAll", true);
    await commit("setData", response);
  },
  /**
   * Fetch root nodes
   */
  async fetchRoots({ commit, dispatch, getters }, payload) {
    //TODO: Dont fetch whole tree
    return await dispatch("fetchAll", {});
    if (getters.roots.length > 0) return;
    const response: ApiItem[] = await this.$axios.$get("/api/elements?parent=null").catch(e => {
      throw new HTTPError("FETCH_ROOT_ELEMENTS_FAILED", e);
    });
    //TODO: Remove emulation of root node query (filter)
    await dispatch("addData", { data: response.filter(item => !item[PARENT_FIELD]) });
  },
  /**
   * Fetch children
   */
  async fetchChildren({ commit, getters, dispatch }, { id }) {
    if (getters.knowsChildren(id)) return;
    const response: ApiItem[] = await this.$axios.$get(`/api/elements/${id}/children`).catch(e => {
      throw new HTTPError("FETCH_CHILD_ELEMENTS_FAILED", { id }, e);
    });
    if (response) {
      commit("setChildCount", { id, count: response.length });
      if (response.length > 0) {
        await dispatch("addData", { data: response });
      }
    }
  },
  /**
   * Fetch all elements in tree including element[id] going upwards to tree root(s)
   */
  async fetchTree({ commit, getters, dispatch }, { id }) {
    await dispatch("fetchRoots", {});
    const pChildren: Promise<any>[] = [];
    if (id) {
      //Load initial item
      let item = await dispatch("fetchItem", { id });
      //Until no more parent items exist:
      while (item.parent) {
        //Do not wait for children to be fetched
        pChildren.push(dispatch("fetchChildren", { id: item.parent }));
        //Load parent of child
        item = await dispatch("fetchItem", { id: item.parent });
      }
      //Wait for all children requests to be performed
      await Promise.all(pChildren);
    }
  }
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>("elements");

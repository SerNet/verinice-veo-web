import { UUID, ApiItem } from "~/types/api";
import { AppElement, AppElementMap, UUIDsMap } from "~/types/app";

import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";
import { uniqueId, unionWith } from "lodash";
import { veoItemToElement } from "~/store/elements/utils";
import { helpers as active } from "./active";

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface State {
  data: ApiItem[];
}
export const state = () => ({ data: [] } as State);
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface Getters {
  items: AppElementMap;
  children: UUIDsMap;
  roots: AppElement[];
}

export const getters: RootDefined.Getters<Getters, State> = {
  items(state, getters) {
    return state.data.map(veoItemToElement).reduce((itemMap, item) => {
      itemMap[item.id] = item;
      return itemMap;
    }, {});
  },
  children(state, getters) {
    return state.data
      .concat()
      .sort((a, b) => String(a[TITLE_FIELD]).localeCompare(b[TITLE_FIELD]))
      .filter(item => item[PARENT_FIELD])
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
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {
  setData: ApiItem[];
  addData: ApiItem[];
}

export const mutations: DefineMutations<Mutations, State> = {
  setData(state, value) {
    state.data = value;
  },
  addData(state, value) {
    state.data = state.data.concat(value);
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Actions {
  init: {};
  fetchItem: { id: UUID; refresh?: boolean };
  fetchItems: { id: UUID[]; refresh?: boolean };
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
  async removeItems({ state, commit, getters }, ids) {
    commit(
      "setData",
      state.data.filter(item => {
        if (item[ID_FIELD]) {
          return ids.indexOf(item[ID_FIELD] as string) === -1;
        } else {
          return false;
        }
      })
    );
  },
  /**
   * Fetch entry from Server
   */ async fetchItem({ commit, dispatch, getters }, { id, refresh }) {
    const items = getters.items;
    if (!refresh && items[id]) {
      return items[id];
    } else {
      const response: ApiItem = await this.$axios.$get(`/api/elements/${id}`);
      await dispatch("addData", { data: [response], refresh });
      return getters.items[id];
    }
  },
  /**
   * Fetch multiple entries from Server
   */ async fetchItems({ commit, dispatch, getters }, { id, refresh }) {
    await Promise.all(id.map(id => dispatch("fetchItem", { id })));
  },
  /**
   * Fetch root nodes
   */ async fetchRoots({ commit, dispatch }, payload) {
    const response: ApiItem[] = await this.$axios.$get("/api/elements?parent=null");
    //TODO: Remove emulation of root node query (filter)
    await dispatch("addData", { data: response.filter(item => !item[PARENT_FIELD]) });
  },
  /**
   * Fetch children
   */ async fetchChildren({ commit, getters, dispatch }, { id }) {
    const response: ApiItem[] = await this.$axios.$get(`/api/elements/${id}/children`);
    await dispatch("addData", { data: response });
  },
  /**
   * Fetch all elements in tree including element[id] going upwards to tree root(s)
   */ async fetchTree({ commit, getters, dispatch }, { id }) {
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

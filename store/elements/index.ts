import { ItemId, VeoItem } from "~/types/api";
import { Element, ElementMap, ElementIdsMap } from "~/store/elements/index.d.ts";

import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";
import { uniqueId } from "lodash";
import { helpers as active } from "./active";

export function veoItemToElement(item: VeoItem): Element {
  const id = item[ID_FIELD] || uniqueId("element_");
  return { id, title: item[TITLE_FIELD], parent: item[PARENT_FIELD], type: item[TYPE_FIELD], data: item };
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface State {
  data: VeoItem[];
}
export const state = () => ({ activeId: undefined, data: [], roots: [], children: {} } as State);
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface Getters {
  items: ElementMap;
  children: ElementIdsMap;
  roots: Element[];
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
  setData: VeoItem[];
  addData: VeoItem[];
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
  fetchItem: { id: ItemId; refresh?: boolean };
  fetchRoots: {};
  fetchChildren: { id: ItemId };
  fetchTree: { id?: ItemId };
  addData: VeoItem[];
  removeItems: ItemId[];
}

export const actions: RootDefined.Actions<Actions, State, Getters, Mutations> = {
  async init({ dispatch }) {},
  async addData({ commit, getters }, data: VeoItem[]) {
    const items = getters.items;
    const uniqueData = data.filter(item => {
      const id = item[ID_FIELD];
      return id ? !items[id] : false;
    });
    commit("addData", uniqueData);
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
    if (refresh) {
      await dispatch("removeItems", [id]);
    }
    const items = getters.items;
    if (items[id]) {
      return items[id];
    } else {
      const response: VeoItem = await this.$axios.$get(`/api/elements/${id}`);
      await dispatch("addData", [response]);
      return getters.items[id];
    }
  },
  /**
   * Fetch root nodes
   */ async fetchRoots({ commit, dispatch }, payload) {
    const response: VeoItem[] = await this.$axios.$get("/api/elements?parent=null");
    //TODO: Remove emulation of root node query (filter)
    commit("setData", response.filter(item => !item[PARENT_FIELD]));
  },
  /**
   * Fetch children
   */ async fetchChildren({ commit, getters, dispatch }, { id }) {
    const response: VeoItem[] = await this.$axios.$get(`/api/elements/${id}/children`);
    await dispatch("addData", response);
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
      await pChildren;
    }
  }
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>("elements");

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
  fetchItems: {};
  fetchChildren: { id: ItemId };
}

export const actions: RootDefined.Actions<Actions, State, Getters, Mutations> = {
  async init({ dispatch }) {
    await dispatch("fetchItems", {});
  },
  /**
   * Fetch entries from Server
   */
  async fetchItems({ commit, dispatch }, payload) {
    //TODO: Use /api/elements?parent=null to only query root nodes
    const response: VeoItem[] = await this.$axios.$get("/api/elements");
    //TODO: Remove emulation of root node query (filter)
    commit("setData", response.filter(item => !item[PARENT_FIELD]));
  },
  async fetchChildren({ commit, getters }, { id }) {
    const response: VeoItem[] = await this.$axios.$get(`/api/elements/${id}/children`);
    const items = getters.items;
    //Filter response to add only unique items
    commit("addData", response.filter(item => !items[item[ID_FIELD]!]));
  }
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>("elements");

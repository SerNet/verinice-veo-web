import { VeoItem } from "~/types/api";
import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";

type ItemID = string;

export interface Item {
  id: ItemID;
  title: string;
  parent: string;
  type: string;
  data: VeoItem;
}

type ItemMap = Record<ItemID, Item>;
type ItemIDMap = Record<ItemID, ItemID[]>;
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface State {
  active: ItemID[];
  items: ItemMap;
  roots: ItemID[];
  children: ItemIDMap;
}

export const state = () => ({ active: [], items: {}, roots: [], children: {} } as State);
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Getters {
  breadcrumbById(id: string): string[];
  childrenById(id: string): ItemID[];
}

export const getters: RootDefined.Getters<Getters, State> = {
  breadcrumbById: state => id => {
    const path: string[] = [];
    const itemMap = state.items;
    let parent = id;
    while (parent) {
      const node = itemMap[parent];
      if (node) {
        path.unshift(node.id);
      }
      parent = node && node.parent;
    }
    return path;
  },
  childrenById: state => (id: string) => {
    return state.children[id];
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {
  setItems: ItemMap;
  setActive: ItemID[];
  setRoots: ItemID[];
  setChildren: ItemIDMap;
}

export const mutations: DefineMutations<Mutations, State> = {
  setItems(state, value) {
    state.items = value;
  },
  setActive(state, value) {
    state.active = value;
  },
  setRoots(state, value) {
    state.roots = value;
  },
  setChildren(state, value) {
    state.children = value;
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Actions {
  init: {};
  fetchItems: {};
}

export const actions: RootDefined.Actions<Actions, State, Getters, Mutations> = {
  async init({ dispatch }) {
    await dispatch("fetchItems", {});
  },
  async fetchItems({ commit, dispatch }, payload) {
    const response: VeoItem[] = await this.$axios.$get("/api/elements");

    const itemMap: ItemMap = {};
    const relations: ItemIDMap = {};
    const roots: ItemID[] = [];
    //Build item map:
    response.reduce((itemMap, item) => {
      //Item ID:
      const id =
        item[ID_FIELD] ||
        "no-id-" +
          Math.random()
            .toString(32)
            .substr(2, 5);
      //Rootknoten speichern
      const parentID = item[PARENT_FIELD];
      if (!parentID) {
        roots.push(id);
      } else {
        //oder Beziehungen
        const childrenOf = (relations[parentID] = relations[parentID] || []);
        childrenOf.push(id);
      }

      itemMap[id] = { id, title: item[TITLE_FIELD], parent: item[PARENT_FIELD], type: item[TYPE_FIELD], data: item };
      return itemMap;
    }, itemMap);
    commit("setRoots", roots);
    commit("setItems", itemMap);
    commit("setChildren", relations);
  }
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>("elements");

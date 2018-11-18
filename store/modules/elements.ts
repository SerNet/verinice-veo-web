import { VeoItem } from "~/types/api";
import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import Vue from "vue";
import { createNamespacedHelpers, DefineModule } from "vuex";

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

export interface State {
  active: ItemID[];
  items: ItemMap;
  roots: ItemID[];
  children: ItemIDMap;
}

export interface Getters {
  breadcrumbById: (id: string) => string[];
  childrenById: (id: string) => ItemID[];
}

// /workspace/T:2342:

export interface Mutations {
  setItems: ItemMap;
  setChildren: ItemIDMap;
  setActive: ItemID[];
  setRoots: ItemID[];
}

export interface Actions {
  init: {};
  fetchItems: {};
}

export const helpers = createNamespacedHelpers<State, Getters, Mutations, Actions>("elements");

const module: DefineModule<State, Getters, Mutations, Actions> = {
  namespaced: true,
  state: {
    active: [],
    items: {},
    roots: [],
    children: {}
  },
  getters: {
    breadcrumbById: state => (id: string) => {
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
  },
  mutations: {
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
  },
  actions: {
    async init({ dispatch }) {
      await dispatch("fetchItems", {});
    },
    async fetchItems(this: Vue, { commit, dispatch }, payload) {
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

        itemMap[id] = {
          id,
          title: item[TITLE_FIELD],
          parent: item[PARENT_FIELD],
          type: item[TYPE_FIELD],
          data: item
        };
        return itemMap;
      }, itemMap);
      commit("setRoots", roots);
      commit("setItems", itemMap);
      commit("setChildren", relations);
    }
  }
};

export default module;

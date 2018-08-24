import Vue from "vue";
import { VeoItem } from "api";
import { ID_FIELD, TITLE_FIELD, PARENT_FIELD } from "~/config/api";
import { TreeItem } from "~/models/TreeItem";
import { DefineModule, createNamespacedHelpers } from "vuex";

type ValueMap = { [id: string]: boolean | undefined };

export interface State {
  data: VeoItem[];
  items: TreeItem[];
  current_id: string | null;
}

export interface Getters {
  items: TreeItem[];
  breadcrumbById: (id: string) => TreeItem[];
  hasChildren: (id: string) => boolean;
}

export interface Mutations {
  setData: VeoItem[];
  setItems: TreeItem[];
  setExpand: { index: number; value: boolean };
  setChecked: ValueMap;
  addItems: { from: number; items: TreeItem[] };
  removeItems: { from: number; to: number };
}

export interface Actions {
  init: {};
  addItems: { from?: number; items: VeoItem[]; level?: number };
  fetchItems: {};
  check: { id: string };
  expand: { id: string };
}

export const helpers = createNamespacedHelpers<
  State,
  Getters,
  Mutations,
  Actions
>("tree");

const module: DefineModule<State, Getters, Mutations, Actions> = {
  namespaced: true,
  state: {
    data: [],
    items: [],
    current_id: ""
  },
  getters: {
    items: state =>
      state.items &&
      state.items.filter(
        item => item[PARENT_FIELD] === state.current_id || null
      ),
    breadcrumbById: state => id => {
      const path = [];
      const items: TreeItem[] = state.items;
      let parent: string | undefined = id;
      while (parent) {
        const node = items.find(item => item.id == parent);
        if (node) {
          path.unshift(node);
        }
        parent = node && node.parent;
      }
      return path;
    },
    hasChildren: state => (id: string) => {
      return !!state.data.find(v => v[PARENT_FIELD] === id);
    }
  },
  mutations: {
    setData(state, payload) {
      state.data = payload;
    },
    setItems(state, payload) {
      state.items = payload;
    },
    setExpand(state, { index, value }) {
      const item = state.items[index];
      return item && (item.expanded = value);
    },
    setChecked(state, payload) {
      for (const i in payload) {
        if (payload.hasOwnProperty(i)) {
          state.items[i].checked = payload[i];
        }
      }
    },
    addItems(state, { from, items }) {
      state.items.splice(from + 1, 0, ...items);
    },
    removeItems(state, { from, to }) {
      state.items.splice(from + 1, to);
    }
  },
  actions: {
    async init(this: Vue, { dispatch, state, commit }, payload) {
      await dispatch("fetchItems", {});
    },
    async addItems({ state, commit, getters }, { items, from = 0, level = 0 }) {
      const parent = state.items[from];
      commit("addItems", {
        from,
        items: items.map(v => {
          const model = new TreeItem(
            v,
            level,
            getters.hasChildren(v[ID_FIELD])
          );
          if (parent) model.checked = parent.checked;
          return model;
        })
      });
    },
    async fetchItems(this: Vue, { commit, dispatch }, payload) {
      console.log("fetchItems");
      const response: VeoItem[] = await this.$axios.$get("/api/elements");
      commit("setData", response);
      commit("setItems", []);
      const roots = response.filter(v => v[PARENT_FIELD] == null);

      if (roots) {
        await dispatch("addItems", { items: roots });
      }
    },
    /**
     * Check / uncheck a given item
     */
    async check(this: Vue, { state, dispatch, commit }, { id }) {
      const { items } = state;

      const itemPos = items.findIndex(v => v.id == id);
      const item = items[itemPos];

      //The requested state of the item
      const value = !item.checked;
      //Check this item
      const changes: ValueMap = { [itemPos]: value };

      //Check all items with higher levels
      for (let i = itemPos + 1; i < items.length; i++) {
        //Stop at higher or same levels
        if (items[i].level <= item.level) {
          break;
        }
        changes[i] = value;
      }

      //Do all items at the same level have an equal state?
      const isConsistentState = !items.find(
        v => v.level == item.level && v.checked != value
      );

      const parentValue = isConsistentState ? value : undefined;
      //Set all parent items to appropriate value
      for (let i = itemPos - 1; i >= 0; i--) {
        const row = items[i];
        //is this a parent item?
        if (row.level < item.level) {
          changes[i] = parentValue;
        }
        //Stop if root item reached
        if (row.level == 0) break;
      }

      commit("setChecked", changes);
    },
    /**
     * Expand / collapse a given item
     */
    async expand(
      this: Vue,
      { state, dispatch, commit },
      { id }: { id: string }
    ) {
      const { data, items } = state;

      const itemPos = items.findIndex(v => v.id == id);
      const item = items[itemPos];

      if (item && data) {
        //If item is not yet expanded
        if (!item.expanded) {
          //Find children in data
          const children = data.filter(v => v[PARENT_FIELD] == id);
          //Set item to expanded
          commit("setExpand", { index: itemPos, value: true });
          //Add items after parent item with increased level
          await dispatch("addItems", {
            from: itemPos,
            items: children,
            level: item.level + 1
          });
        } else {
          //Find number of items after item with higher level
          const nextItemPos = items
            .slice(itemPos + 1)
            .findIndex(v => v.level == item.level);
          //Set item to collapsed
          commit("setExpand", { index: itemPos, value: false });
          //Remove items after item from list
          commit("removeItems", {
            from: itemPos,
            to: nextItemPos == -1 ? items.length : nextItemPos
          });
        }
      }
    }
  }
};

export default module;

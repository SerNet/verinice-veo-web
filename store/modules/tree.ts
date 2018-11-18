import Vue from "vue";
import { createNamespacedHelpers, DefineModule } from "vuex";
import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import { TreeItem } from "~/models/TreeItem";
import { VeoItem } from "~/types/api";

type ValueMap = { [id: string]: boolean | undefined };

interface SimpleTreeItem {
  id: string;
  name: string;
}

export interface State {
  active: string;
  selection: TreeItem[];
  error: string | null;
  data: VeoItem[];
  items: TreeItem[];
  current_id: string | null;
}

export interface Getters {
  items: TreeItem[];
  tree: SimpleTreeItem[];
  breadcrumb: (id: string) => VeoItem[];
  breadcrumbById: (id: string) => TreeItem[];
  hasChildren: (id: string) => boolean;
  treeChildren: (id?: string) => SimpleTreeItem[];
  treeBreadcrumb: SimpleTreeItem[];
}

// /workspace/T:2342:

export interface Mutations {
  setError: string;
  setData: VeoItem[];
  setSelection: TreeItem[];
  setItems: TreeItem[];
  setExpand: { index: number; value: boolean };
  setChecked: ValueMap;
  addItems: { from: number; items: TreeItem[] };
  setActiveItem: string;
  removeItems: { from: number; to: number };
}

export interface Actions {
  init: {};
  addItems: { from?: number; items: VeoItem[]; level?: number };
  addItem: { parent: string; type: string };
  fetchItems: {};
  open: string;
  check: { id: string };
  expand: { id: string };
  delete: string[];
  selectAll: boolean;
}

export const helpers = createNamespacedHelpers<State, Getters, Mutations, Actions>("tree");

const module: DefineModule<State, Getters, Mutations, Actions> = {
  namespaced: true,
  state: {
    active: "",
    selection: [],
    error: null,
    data: [],
    items: [],
    current_id: ""
  },
  getters: {
    tree: (state, getters) =>
      state.data
        .filter(item => !item.parent)
        .map(item => ({
          id: item[ID_FIELD] || "NO_ID",
          name: item[TITLE_FIELD] || "Kein Text",
          children: getters.treeChildren(item["$veo.id"])
        })),
    treeChildren: (state, getters) => id => {
      return state.data
        .filter(item => item.parent == id)
        .map(item => ({
          id: item[ID_FIELD] || "NO_ID",
          name: item[TITLE_FIELD] || "Kein Text",
          children: getters.treeChildren(item["$veo.id"])
        }));
    },
    treeBreadcrumb: (state, getters) => {
      const path: SimpleTreeItem[] = [];
      const items: VeoItem[] = state.data;
      let parent: string | undefined = state.active;
      while (parent) {
        const node = items.find(item => item[ID_FIELD] == parent);
        if (node) {
          path.unshift({
            id: node[ID_FIELD] || "",
            name: node[TITLE_FIELD]
          });
        }
        parent = node && node[PARENT_FIELD];
      }
      return path;
    },
    items: state => state.items && state.items.filter(item => item[PARENT_FIELD] === state.current_id || null),
    breadcrumb: state => id => {
      const path: VeoItem[] = [];
      const items: VeoItem[] = state.data;
      let parent: string | undefined = id;
      while (parent) {
        const node = items.find(item => item[ID_FIELD] == parent);
        if (node) {
          path.unshift(node);
        }
        parent = node && node[PARENT_FIELD];
      }
      return path;
    },
    breadcrumbById: state => id => {
      const path: TreeItem[] = [];
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
    setError(state, payload) {
      state.error = payload;
    },
    setItems(state, payload) {
      state.items = payload;
    },
    setExpand(state, { index, value }) {
      const item = state.items[index];
      return item && (item.expanded = value);
    },
    setSelection(state, value) {
      state.selection = value;
    },
    setChecked(state, payload) {
      for (const i in payload) {
        if (payload.hasOwnProperty(i)) {
          const isChecked = payload[i];
          const item = state.items[i];
          item.checked = isChecked;
        }
      }
    },
    setActiveItem(state, id) {
      state.active = id;
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
    async open(this: Vue, { commit }, id) {
      await commit("setActiveItem", id);
    },
    async addItems({ state, commit, getters }, { items, from = 0, level = 0 }) {
      const parent = state.items[from];
      commit("addItems", {
        from,
        items: items.map(v => {
          const model = new TreeItem(v, level, getters.hasChildren(v[ID_FIELD]!));
          if (parent) model.checked = parent.checked;
          return model;
        })
      });
    },
    async addItem(this: Vue, { state, commit, dispatch }, payload) {
      const created = new TreeItem();
      created.parent = payload.parent;
      created.id = "";
      created.type = payload.type;

      const from = payload.parent ? state.items.findIndex(item => item.id == payload.parent) : 0;

      console.log("from", state.items, from, payload);
      const parent = from > 0 ? state.items[from] : null;
      created.checked = parent ? parent.checked : false;
      commit("addItems", {
        from: from > 0 ? from : state.items.length - 1,
        items: [created]
      });
    },
    async fetchItems(this: Vue, { commit, dispatch }, payload) {
      commit("setError", "");
      try {
        const response: VeoItem[] = await this.$axios.$get("/api/elements");
        commit("setData", response);
        commit("setItems", []);
        const roots = response.filter(v => v[PARENT_FIELD] == null);

        if (roots) {
          await dispatch("addItems", { items: roots });
        }
      } catch (e) {
        commit("setData", []);
        commit("setItems", []);
        commit("setError", e.message);
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
      const isConsistentState = !items.find(v => v.level == item.level && v.checked != value);

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
      commit("setSelection", items.filter(item => item.checked));
    },
    /**
     * Expand / collapse a given item
     */
    async expand(this: Vue, { state, dispatch, commit }, { id }: { id: string }) {
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
          const nextItemPos = items.slice(itemPos + 1).findIndex(v => v.level == item.level);
          //Set item to collapsed
          commit("setExpand", { index: itemPos, value: false });
          //Remove items after item from list
          commit("removeItems", {
            from: itemPos,
            to: nextItemPos == -1 ? items.length : nextItemPos
          });
        }
      }
    },
    async delete(this: Vue, { state, dispatch, commit }, ids) {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        await this.$axios.delete(`/api/elements/${id}`);
      }
      commit("setSelection", state.selection.filter(item => ids.indexOf(item.id) == -1));
      await dispatch("init", {});
    },
    async selectAll(this: Vue, { state, dispatch, commit }, value) {
      const changes = {};
      state.items.forEach((item, idx) => {
        if (item.checked) changes[idx] = false;
      });
      commit("setChecked", changes);
      commit("setSelection", []);
    }
  }
};

export default module;

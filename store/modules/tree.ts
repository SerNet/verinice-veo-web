import Vue from "vue";
import { RootState } from "~/store/index";
import { Module } from "vuex";
import { TreeItem } from "~/store/modules/tree";

const ID_FIELD = "$veo.id";
const PARENT_FIELD = "parent";
const TITLE_FIELD = "$veo.title";

type ValueMap = { [id: string]: boolean | undefined };

export interface TreeItem {
  [ID_FIELD]: string;
  [PARENT_FIELD]: string;
  [TITLE_FIELD]: string;
  schema: string;
  title: string;
}

export class InternalTreeItem {
  id: string;
  expanded: boolean = false;
  checked: boolean | undefined = false;
  parent: string;
  title: string;

  constructor(
    public item: TreeItem,
    public level = 0,
    public hasChildren: boolean = false,
    public children?: InternalTreeItem[]
  ) {
    this.id = item[ID_FIELD];
    this.title = item[TITLE_FIELD];
    this.parent = item[PARENT_FIELD];
  }
}

const state = {
  data: [] as TreeItem[],
  items: (<any>undefined) as InternalTreeItem[],
  current_id: "" as string | null
};

export type TreeState = typeof state;

const module: Module<TreeState, RootState> = {
  namespaced: true,
  state,
  getters: {
    items: state =>
      state.items &&
      state.items.filter(
        item => item[PARENT_FIELD] === state.current_id || null
      ),
    breadcrumbById: state => (id: string) => {
      const path = [];
      const items: InternalTreeItem[] = state.items;
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
    setData(state, value: TreeItem[]) {
      state.data = value;
    },
    setItems(state, value: InternalTreeItem[]) {
      state.items = value;
    },
    setExpand(state, { index, value }: { index: number; value: boolean }) {
      const item = state.items[index];
      return item && (item.expanded = value);
    },
    setChecked(state, index: ValueMap) {
      for (const i in index) {
        if (index.hasOwnProperty(i)) {
          state.items[i].checked = index[i];
        }
      }
    },
    addItems(
      state,
      { from, items }: { from: number; items: InternalTreeItem[] }
    ) {
      state.items.splice(from + 1, 0, ...items);
    },
    removeItems(state, { from, to }) {
      state.items.splice(from + 1, to);
    }
  },
  actions: {
    async init(this: Vue, { state, commit }) {
      //commit("setData", null);
    },
    async addItems(
      this: Vue,
      { state, commit, getters },
      { from = 0, items, level = 0 }
    ) {
      const parent = state.items[from];
      commit("addItems", {
        from,
        items: items.map((v: TreeItem, i: number) => {
          const model = new InternalTreeItem(
            v,
            level,
            getters.hasChildren(v[ID_FIELD])
          );
          if (parent) model.checked = parent.checked;
          return model;
        })
      });
    },
    async getItems(this: Vue, { state, commit, dispatch }, { id } = {}) {
      //commit("setActive", id);
      if (state.items) return;
      const response: TreeItem[] = await this.$axios.$get("/api/elements");
      commit("setData", response);
      commit("setItems", []);
      const root = response.find(v => v[PARENT_FIELD] == null);

      if (root) {
        await dispatch("addItems", { items: [root] });
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

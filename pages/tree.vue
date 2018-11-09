<template>
  <div style="width: 100%; height: 100%;">
    <h3 class="grey--text pa-2">IT Grundschutz</h3>
    <div style="position: absolute; top: 50px; left:0; right:0; bottom:0; overflow: auto">
      <v-treeview v-model="selected" :open="open" @update:open="onOpen" :items="items" @update:active="onActive" selectable="" selected-color="primary" activatable item-key="id" item-text="title">
        <template slot="prepend" slot-scope="{ item, open, leaf }">
          <v-icon v-if="!item.file">
            {{ open ? 'folder_open' : 'folder' }}
          </v-icon>
          <v-icon v-else>
            {{ files[item.file] }}
          </v-icon>
        </template>
      </v-treeview>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Item, helpers as elements } from "~/store/modules/elements";

type TreeItem = Item & { children?: TreeItem[] };

export default Vue.extend({
  computed: {
    ...elements.mapState({
      itemMap: "items",
      children: "children",
      roots: "roots"
    })
  },
  data: () => ({
    open: [] as string[],
    items: [] as TreeItem[],
    files: {
      html: "mdi-language-html5",
      js: "mdi-nodejs",
      json: "mdi-json",
      md: "mdi-markdown",
      pdf: "mdi-file-pdf",
      png: "mdi-file-image",
      txt: "mdi-file-document-outline",
      xls: "mdi-file-excel"
    },
    selected: []
  }),
  watch: {
    roots: {
      handler(val) {
        this.computeItems(this.open);
      },
      immediate: true
    }
  },
  methods: {
    computeItems(open: string[]) {
      const isOpen = (id: string) => {
        if (!id) return true;
        return this.open.indexOf(id) !== -1;
      };
      //Add children to item:
      const children: (id: string) => TreeItem = id => {
        const item = this.itemMap[id];

        if (!id || !item) return item;
        if (isOpen(id) || isOpen(item.parent)) {
          const _childs = this.children[id];
          const childs = _childs && _childs.map(children);
          return { ...item, children: childs };
        } else {
          return item;
        }
      };

      return (this.items = this.roots.map(children));
    },
    onOpen(open: string[]) {
      //TODO: Infinite loop when removing items from tree after closing them, waiting for vuetify fix?
      const hash = String(open);
      if (hash != this["_lastHash"]) {
        this.computeItems(open);
        this["_lashHash"] = hash;
      }
      this.open = open;
    },
    onActive(items: string[]) {
      if (items && items[0]) {
        const item = items[0];
        this.$router.push({
          path: "/elements/" + item,
          query: this.$route.query
        });
      }
    }
  },
  async validate({ store, params }) {
    if (!store.getters["auth/isAuthorized"]) return false;
    if (params.id && String(params.id).indexOf(".") !== -1) return false;
    return true;
  },
  async asyncData({ store, params }) {
    const breadcrumbById = store.getters["elements/breadcrumbById"];
    return {
      open: params.id ? breadcrumbById(params.id) : []
    };
  }
});
</script>
<style lang="stylus" scoped>
>>> .v-treeview-node--active {
  background-color: #ffeaee !important;
}
</style>

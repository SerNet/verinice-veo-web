<template>
  <div style="width: 100%; height: 100%;">
    <h3 class="grey--text pa-2">Baum</h3>
    <div style="position: absolute; top: 50px; left:0; right:0; bottom:0; overflow: auto">
      <v-treeview
        v-model="selected"
        :active="active"
        :open="open"
        :items="items"
        @update:active="onActive"
        :load-children="loadChildren"
        selectable
        selected-color="primary"
        activatable
        item-key="id"
        item-text="title"
      >
        <template slot="prepend" slot-scope="{ item, open, leaf }">
          <v-icon v-if="!item.file">{{ open ? 'folder_open' : 'folder' }}</v-icon>
          <v-icon v-else>{{ files[item.file] }}</v-icon>
        </template>
      </v-treeview>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { AppElement } from "~/types/app";
import { helpers as elements } from "~/store/elements";
import { helpers as activeElement } from "~/store/elements/active";
import { UUID } from "~/types/api";
import { union } from "lodash";

type AppElementWithChildren = AppElement & { children: AppElement[] };

export default Vue.extend({
  name: "tree",
  computed: {
    ...elements.mapGetters({
      childMap: "children",
      itemMap: "items",
      roots: "roots"
    }),
    ...activeElement.mapGetters({
      item: "item",
      breadcrumb: "breadcrumb"
    }),
    items(): AppElement[] {
      const openIds = this.open;
      const itemMap = this.itemMap;
      const items = this.roots.concat();
      const createChildren = (item: AppElement): AppElementWithChildren => {
        const children = this.childMap[item.id];
        return {
          ...item,
          children: children
            ? children.map(id => createChildren(this.itemMap[id]))
            : []
        };
      };
      return items.map(item => createChildren(item));
    }
  },
  activated() {
    console.log("Tree activated");
  },
  deactivated() {
    console.log("Tree deactiviated");
  },
  created() {
    this.open = this.breadcrumb.map(item => item.id);
    if (this.item) {
      this.active = [this.item.id];
    }
  },
  data() {
    return {
      active: [] as UUID[],
      open: [] as UUID[],
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
      selected: [] as UUID[]
    };
  },
  methods: {
    ...elements.mapActions({
      fetchChildren: "fetchChildren"
    }),
    onActive(ids: string[]) {
      if (ids.length)
        this.$router.push({
          path: "/editor/" + ids.shift(),
          query: this.$route.query
        });
    },
    async loadChildren(item: Element): Promise<any> {
      console.log("open children", item);
      await this.fetchChildren({ id: item.id });
    }
  },
  async validate({ store, params }) {
    if (!store.getters["auth/isAuthorized"]) return false;
    if (params.id && String(params.id).indexOf(".") !== -1) return false;
    return true;
  },
  async fetch({ store, params: { id } }) {
    await elements.dispatch("fetchTree", { id });
  }
});
</script>

<style lang="stylus" scoped>
>>> .v-treeview-node--active {
  background-color: #ffeaee !important;
}
</style>

<template>
  <v-layout column fill-height>
    <v-flex shrink>
      <h3 class="grey--text pa-2">Baum</h3>
    </v-flex>
    <v-flex>
      <v-treeview
        v-model="selected"
        :active.sync="active"
        @click.native="onClick"
        :open="open"
        :items="items"
        @update:active="onActive"
        @update:open="onOpen"
        :load-children="loadChildren"
        selectable
        selected-color="primary"
        activatable
        item-key="id"
        item-text="title"
      >
        <template slot="prepend" slot-scope="{ item, open }">
          <v-icon v-if="!item.file">{{ open ? 'folder_open' : 'folder' }}</v-icon>
          <v-icon v-else>{{ files[item.file] }}</v-icon>
        </template>
      </v-treeview>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { Route } from "vue-router";
import { AppElement } from "~/types/app";
import { UUID } from "~/types/api";
import { union } from "lodash";

import authStore from "~/store/auth";
import elementsStore from "~/store/elements";
import activeElementStore from "~/store/elements/active";
import {
  mapState,
  mapGetters,
  mapActions,
  useStore
} from "vuex-typesafe-class";

type AppElementWithChildren = AppElement & { children?: AppElement[] };

export default Vue.extend({
  computed: {
    ...mapGetters(elementsStore, {
      childMap: "children",
      itemMap: "items",
      roots: "roots",
      childCount: "countChildren"
    }),
    ...mapGetters(activeElementStore, {
      item: "item",
      breadcrumb: "breadcrumb"
    }),
    items(): AppElement[] {
      const openIds = this.open;
      const itemMap = this.itemMap;
      const items = this.roots.concat();
      const createChildren = (item: AppElement): AppElementWithChildren => {
        const children = this.childMap[item.id];
        if (this.childCount(item.id) < 1) {
          return item;
        } else {
          return {
            ...item,
            children: children
              ? children.map(id => createChildren(this.itemMap[id]))
              : []
          };
        }
      };
      return items.map(item => createChildren(item));
    }
  },
  created() {
    this.selectActiveItem();
  },
  watch: {
    async $route(v: Route, o: Route) {
      if (v.path != o.path) {
        await useStore(elementsStore, this).fetchTree({ id: v.params.id });
        this.selectActiveItem();
      }
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
    ...mapActions(elementsStore, {
      fetchChildren: "fetchChildren"
    }),
    selectActiveItem() {
      const breadcrumbIds = this.breadcrumb.map(item => item.id).slice(0, -1);
      this.open = union(this.open || [], breadcrumbIds);
      if (this.item) {
        this.active = [this.item.id];
      }
    },
    onClick($event: MouseEvent) {
      const id = this.active.concat().shift();
      if (id && this.$route.params.id != id) {
        this.$router.push({
          path: this.$route.params.id
            ? this.$route.path.replace(this.$route.params.id, id)
            : `/editor/${id}`,
          query: this.$route.query
        });
      }
    },
    async onOpen(ids: string[]) {
      //No items expanded: Check root nodes
      if (ids.length == 0 && this.roots) {
        return await Promise.all(
          this.roots.map(root => this.fetchChildren(root))
        );
      }
      //Load children of open ids
      return await Promise.all(
        ids.reduce(
          (promises, id) => {
            const children = this.childMap[id] || [];
            return promises.concat(
              children.map(id => {
                return this.fetchChildren({ id });
              })
            );
          },
          [] as Promise<any>[]
        )
      );
    },
    onActive(ids: string[]) {
      /*if (ids.length)
        this.$router.push({
          path: "/editor/" + ids.shift(),
          query: this.$route.query
        });*/
    },
    async loadChildren(item: Element): Promise<any> {
      await this.fetchChildren({ id: item.id });
    }
  },
  /*async validate({ store, params }) {
    const $auth = useStore(authStore, store);
    if (!$auth.isAuthorized) return false;
    if (params.id && String(params.id).indexOf(".") !== -1) return false;
    return true;
  },*/
  async fetch({ store, params }) {
    await useStore(elementsStore, store).fetchTree({ id: params.id });
  }
});
</script>

<style lang="stylus" scoped>
>>> .v-treeview-node__label {
  padding: 5px;
  cursor: pointer;
}

>>> .v-treeview-node--active {
  background-color: transparent !important;

  > .v-treeview-node__root {
    .v-treeview-node__content {
      background-color: #ffeaee !important;
      vertical-align: middle;
      flex-grow: 0;
      flex-shrink: 0;
      border-radius: 5px;
    }
  }
}
</style>

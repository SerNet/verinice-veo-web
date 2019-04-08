<template>
  <v-layout fill-height column>
    <v-flex shrink>
      <element-header :visible="headerOpen"></element-header>
    </v-flex>
    <v-flex class="ma-3">
      <v-list class="ma-0 pa-0" style="border: 1px solid #CCC;">
        <v-list-tile class="grey--text" v-show="element.parent" avatar :to="'/browser/'+element.parent">
          <v-list-tile-avatar>
            <v-icon>arrow_upward</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>Übergeordnetes Element öffnen</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <template v-if="children && children.length > 0">
          <v-list-tile v-for="item in children" :key="item.id" avatar :to="'/browser/'+item.id">
            <v-list-tile-avatar>
              <v-icon>folder</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              <v-list-tile-sub-title>Typ: {{ item.type }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";

import VeoForm from "~/components/Editor/index.vue";
import ElementHeader from "~/components/ElementHeader/index.vue";

import elementsStore from "~/store/elements";
import activeElementStore from "~/store/elements/active";
import {
  mapState,
  mapGetters,
  mapActions,
  useStore
} from "vuex-typesafe-class";

export default Vue.extend({
  components: {
    ElementHeader
  },
  data() {
    return {
      headerOpen: true
    };
  },
  computed: {
    ...mapGetters(elementsStore, {
      itemMap: "items",
      childCount: "countChildren"
    }),
    ...mapGetters(activeElementStore, {
      breadcrumb: "breadcrumb",
      element: "item",
      children: "children"
    }),
    items() {}
  },
  methods: {},
  async fetch({ store, query, params }) {
    if (params.id) {
      if (params.id == "new") {
        //await formStore.dispatch("create", { type, parent });
      } else {
        await useStore(activeElementStore, store).fetchItem({ id: params.id });
        //await formStore.dispatch("load", { id });
      }
    }
  },
  validate({ store, params }) {
    return String(params.id || "").indexOf(".") === -1;
  }
});
</script>

<style lang="stylus" scoped>
.breadcrumb {
  position: absolute;
  right: 0;
  left: 0;
  top: 0px;
}
</style>

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

import { helpers as elementsStore } from "~/store/elements";
import { helpers as activeElement } from "~/store/elements/active";

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
    ...elementsStore.mapGetters({
      itemMap: "items",
      childCount: "childCount"
    }),
    ...activeElement.mapGetters({
      breadcrumb: "breadcrumb",
      element: "item",
      children: "children"
    }),
    items() {}
  },
  methods: {},
  async fetch({ store, query: { type, parent }, params: { id } }) {
    if (id) {
      if (id == "new") {
        //await formStore.dispatch("create", { type, parent });
      } else {
        await activeElement.dispatch("fetchItem", { id });
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

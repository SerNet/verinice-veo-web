<template>
  <v-layout fill-height column>
    <v-flex shrink>
      <element-header :visible="headerOpen"></element-header>
    </v-flex>
    <v-flex class="ma-3">
      <v-list>
        <v-list-tile>

        </v-list-tile>
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
      elements: "items"
    }),
    ...activeElement.mapGetters({
      breadcrumb: "breadcrumb",
      element: "item",
      children: "children"
    })
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

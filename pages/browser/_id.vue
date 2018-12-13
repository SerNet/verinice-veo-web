<template>
  <v-layout class="ml-3 mr-3" fill-height column>
    <element-header v-model="headerOpen"></element-header>
    <span>BROWSER</span>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { Element } from "~/types/app";
import VeoForm from "~/components/Editor/index.vue";
import ElementHeader from "~/components/ElementHeader/index.vue";

import { helpers as formStore } from "~/store/form";
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
      element: "item"
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

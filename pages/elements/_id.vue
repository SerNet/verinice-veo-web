<template>
  <v-layout column>
    <veo-breadcrumb :items="breadcrumb" @change="onBreadcrumbChange">
      <template slot-scope="props">{{props.title}}</template>
    </veo-breadcrumb>
    <veo-form :model="formModel" :schema="formSchema"></veo-form>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";

import TreeNav from "~/components/TreeNav/TreeNav.vue";
import VeoForm from "~/components/Form/Form.vue";
import VeoBreadcrumb from "~/components/VeoBreadcrumb.vue";

import { helpers as treeStore } from "~/store/modules/tree";
import { helpers as formStore } from "~/store/modules/form";

export default Vue.extend({
  components: {
    TreeNav,
    VeoForm,
    VeoBreadcrumb
  },
  data() {
    return {
      groups: ["IT Baseline-Catalog", "BSI Model"]
    };
  },
  computed: {
    ...treeStore.mapState({ treeItems: "items" }),
    ...formStore.mapState({
      formModel: "model",
      formSchema: "schema",
      breadcrumb: "breadcrumb"
    })
  },
  methods: {
    onBreadcrumbChange(item: string) {}
  },
  async fetch({ store, params }) {
    //await store.dispatch("tree/getItems", params);
    if (params["id"]) {
      console.log("_id.vue", params);
      await store.dispatch("form/load", params);
    }
  },
  validate({ store, params }) {
    return String(params.id || "").indexOf(".") === -1;
  }
});
</script>

<style lang="stylus" scoped>
.tree-nav {
  position: fixed;
  top: 64px;
  left: 80px;
  bottom: 0;
  width: 300px;
}
</style>

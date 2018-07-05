<template>
  <v-layout column>
    <veo-breadcrumb :items="breadcrumb" @change="onBreadcrumbChange"></veo-breadcrumb>
    <veo-form :model="formModel" :schema="formSchema"></veo-form>
  </v-layout>
</template>

<script lang="ts">
import {
  Component,
  Inject,
  Model,
  Prop,
  Vue,
  Watch
} from "nuxt-property-decorator";
import { namespace } from "nuxt-class-component";
import { Store } from "vuex";
import TreeNav from "~/components/TreeNav/TreeNav.vue";
import VeoForm from "~/components/VeoForm.vue";
import VeoBreadcrumb from "~/components/VeoBreadcrumb.vue";

const treeStore = namespace("tree");
const formStore = namespace("form");

@Component({
  components: {
    TreeNav,
    VeoForm,
    VeoBreadcrumb
  }
})
export default class extends Vue {
  @treeStore.State("items") treeItems: any[];
  @formStore.State("model") formModel: Object;
  @formStore.State("schema") formSchema: Object;
  @formStore.State("breadcrumb") breadcrumb: string[];

  groups: any[] = ["IT Baseline-Catalog", "BSI Model"];

  onBreadcrumbChange(item: string) {
      
  }

  async fetch({ store, params }: { store: Store<any>; params: Object }) {
    await store.dispatch("tree/getItems");
    if(params['id']) {
        await store.dispatch("form/load", params)
    }
  }
}
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

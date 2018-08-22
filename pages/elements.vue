<template>
  <v-layout row>
    <v-flex>
      <tree-nav class="tree-nav" :groups="groups" :items="items" @expand="expandItem" @check="checkItem" to-prefix="/elements/"></tree-nav>
    </v-flex>
    <v-flex xs12 id="content">
      <nuxt-child></nuxt-child>
    </v-flex>
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
import { InternalTreeItem } from "~/store/modules/tree";

const formStore = namespace("form");
const treeStore = namespace("tree");

@Component({
  components: {
    TreeNav
  }
})
export default class extends Vue {
  @treeStore.State("items") items: Object[];
  @treeStore.Action("expand") expandItem: Function;
  @treeStore.Action("check") checkItem: Function;

  groups: any[] = ["IT Baseline-Catalog", "BSI Model"];

  async fetch({ store, params }: { store: Store<any>; params: Object }) {
    await store.dispatch("tree/getItems");
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
  /* TODO */
}

#content {
  margin-left: 300px;
}

@media only screen and (max-width: 599px /* 959 */) {
  #content {
    margin-left: 0;
  }
}
</style>

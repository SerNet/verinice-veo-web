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
import TreeNav from "~/components/TreeNav/TreeNav.vue";
import Vue from "vue";
import { helpers as treeStore } from "~/store/modules/tree";

export default Vue.extend({
  components: {
    treeNav: TreeNav
  },
  data() {
    return {
      groups: ["IT Baseline-Catalog", "BSI Model"]
    };
  },
  computed: {
    ...treeStore.mapState({
      items: "items"
    })
  },
  methods: {
    ...treeStore.mapActions({
      expandItem: "expand",
      checkItem: "check",
      fetchItems: "fetchItems"
    })
  },
  async fetch({ store }) {
    await store.dispatch("tree/init");
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

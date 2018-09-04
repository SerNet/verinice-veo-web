<template>
  <v-layout row>
    <v-flex>
      <tree-nav class="tree-nav" :groups="groups" :items="items" :selection="selection" :error="error" @expand="expandItem" @check="checkItem" to-prefix="/elements/"></tree-nav>
      <v-selection-snackbar style="width: 300px" :selection="selection" :actions="actions" @action="onActionClick"></v-selection-snackbar>
    </v-flex>
    <v-flex xs12 id="content">
      <nuxt-child></nuxt-child>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import TreeNav from "~/components/TreeNav/TreeNav.vue";
import vSelectionSnackbar from "~/components/SelectionSnackbar.vue";
import Vue from "vue";
import { helpers as treeStore } from "~/store/modules/tree";

interface ISelectionAction {
  id: string;
  title: string;
}

export default Vue.extend({
  components: {
    treeNav: TreeNav,
    vSelectionSnackbar
  },
  data() {
    return {
      groups: ["IT Baseline-Catalog", "BSI Model"],
      actions: [
        { title: "Löschen" },
        { title: "Kopieren nach..." },
        { title: "Verschieben nach..." },
        { title: "Verknüpfen mit...", divide: true },
        { id: "DESELECT_ALL", title: "Auswahl aufheben" }
      ]
    };
  },
  computed: {
    ...treeStore.mapState({
      items: "items",
      selection: "selection",
      error: "error"
    })
  },
  methods: {
    ...treeStore.mapActions({
      expandItem: "expand",
      checkItem: "check",
      fetchItems: "fetchItems",
      selectAll: "selectAll"
    }),
    onActionClick(action: ISelectionAction) {
      switch (action.id) {
        case "DESELECT_ALL":
          return this.selectAll(false);
      }
    }
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

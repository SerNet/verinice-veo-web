<template>
    <v-layout column>
        <tree-nav class="tree-nav" :max-height="maxHeight-70" :groups="groups" :items="items" :selection="selection" :error="error" @expand="expandItem" @check="checkItem" to-prefix="/elements/"></tree-nav>
        <v-selection-snackbar style="width: 300px" :selection="selection" :actions="actions" @action="onActionClick"></v-selection-snackbar>
    </v-layout>
</template>

<script lang="ts">
import TreeNav from "~/components/TreeNav/TreeNav.vue";
import vSelectionSnackbar from "~/components/SelectionSnackbar.vue";
import AddDialog from "~/components/MainLayout/AddDialog.vue";
import Vue from "vue";
import { helpers as treeStore } from "~/store/modules/tree";
import { helpers as schemaStore } from "~/store/modules/schema";
import { ID_FIELD, TITLE_FIELD, PARENT_FIELD } from "~/config/api";

interface ISelectionAction {
  id: string;
  title: string;
}

export default Vue.extend({
  components: {
    treeNav: TreeNav,
    AddDialog,
    vSelectionSnackbar
  },
  props: {
    maxHeight: Number
  },
  data() {
    return {
      ID_FIELD,
      TITLE_FIELD,
      dialog: false,
      groups: ["IT Baseline-Catalog", "BSI Model"],
      actions: [
        { id: "DELETE", title: "Löschen" },
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
      data: "data",
      selection: "selection",
      error: "error"
    }),
    ...schemaStore.mapState({
      schemaNames: "schemaNames"
    }),
    ...treeStore.mapGetters({
      breadcrumb: "breadcrumb"
    }),
    parentItems() {
      return [
        {
          [TITLE_FIELD]: "Kein Elternelement",
          [ID_FIELD]: null
        } as any
      ].concat(this.data);
    }
  },
  methods: {
    ...treeStore.mapActions({
      expandItem: "expand",
      checkItem: "check",
      fetchItems: "fetchItems",
      selectAll: "selectAll",
      deleteItem: "delete"
    }),
    onActionClick(action: ISelectionAction) {
      switch (action.id) {
        case "DELETE":
          return this.deleteItem(this.selection.map(item => item.id));
        case "DESELECT_ALL":
          return this.selectAll(false);
      }
    },
    async addElement($event: { parent: string; type: string }) {
      //await this.$store.dispatch("tree/addItem", $event);
      await this.$router.push({
        path: `/elements/new`,
        query: $event
      });
    }
  },
  async fetch({ store }) {
    await store.dispatch("tree/init");
  }
});
</script>

<style lang="stylus" scoped>
>>> .breadcrumb-item {
    color: #AAA;

    & + .breadcrumb-item:before {
        content: ' > ';
    }
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

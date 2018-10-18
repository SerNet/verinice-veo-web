<template>
  <div style="width: 100%; height: 100%;">
    <h3 class="grey--text pa-2">IT Grundschutz</h3>
    <div style="position: absolute; top: 50px; left:0; right:0; bottom:0; overflow: auto">
      <v-treeview v-model="tree" :open="open" :items="items" @update:active="onActive" selectable="" selected-color="primary" activatable item-key="id" item-text="name">
        <template slot="prepend" slot-scope="{ item, open, leaf }">
          <v-icon v-if="!item.file">
            {{ open ? 'folder_open' : 'folder' }}
          </v-icon>
          <v-icon v-else>
            {{ files[item.file] }}
          </v-icon>
        </template>
      </v-treeview>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { helpers as tree } from "~/store/modules/tree";

export default Vue.extend({
  computed: {
    ...tree.mapGetters({
      items: "tree"
    })
  },
  data: () => ({
    open: [],
    files: {
      html: "mdi-language-html5",
      js: "mdi-nodejs",
      json: "mdi-json",
      md: "mdi-markdown",
      pdf: "mdi-file-pdf",
      png: "mdi-file-image",
      txt: "mdi-file-document-outline",
      xls: "mdi-file-excel"
    },
    tree: []
  }),
  methods: {
    onActive(items: string[]) {
      if (items && items[0]) {
        const item = items[0];
        this.$router.push({
          path: "/elements/" + item,
          query: this.$route.query
        });
      }
    }
  }
});
</script>
<style lang="stylus" scoped>
>>> .v-treeview-node--active {
  background-color: #ffeaee !important;
}
</style>

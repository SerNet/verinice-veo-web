<template>
  <v-layout class="hidden-sm-and-down elevation-1" style="z-index: 2; min-width: 300px; max-width: 300px;">
    <v-toolbar class="tree-toolbar" flat dense>
      <v-menu :nudge-width="100">
        <v-toolbar-title slot="activator">
          <span>{{menuItems[1]}}</span>
          <v-icon>arrow_drop_down</v-icon>
        </v-toolbar-title>
        <v-list>
          <v-list-tile v-for="item in menuItems" :key="item">
            <v-list-tile-title v-text="item"/>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-spacer/>
      <v-btn icon>
        <v-icon>search</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-toolbar>
    <tree-view v-model="treeData" :treeTypes="treeTypes" :openAll="true"/>
  </v-layout>
</template>

<script lang="typescript">
import TreeView from "./TreeView.vue";
import Vue from "vue";

export default Vue.extend({
  name: "TreeNav",
  components: {
    TreeView: TreeView
  },
  data() {
    return {
      treeData: [],
      treeTypes: [],
      menuItems: ["Item", "Item"]
    };
  }
});
</script>

<style scoped>
</style>

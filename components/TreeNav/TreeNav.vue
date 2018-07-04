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

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { namespace } from 'nuxt-class-component'
import TreeView from "~/components/TreeNav/TreeView.vue";
const store = namespace('nav')

@Component({
  components: {
    TreeView
  }
})
export default class TreeNav extends Vue {
  treeData = []
  treeTypes = []
  menuItems = ["Item", "Item"]
}
</script>

<style scoped>
</style>

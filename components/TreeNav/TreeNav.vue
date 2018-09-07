<template>
  <v-layout column class="hidden-sm-and-down elevation-1" style="z-index: 2;">
    <v-toolbar class="tree-toolbar" flat dense>
      <v-menu :nudge-width="100">
        <v-toolbar-title slot="activator">
          <span class="group-title">{{groups?groups[0]:'...'}}</span>
          <v-icon>arrow_drop_down</v-icon>
        </v-toolbar-title>
        <v-list>
          <v-list-tile v-for="item in groups" :key="item">
            <v-list-tile-title v-text="item" />
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-spacer/>
      <v-btn icon>
        <v-icon>search</v-icon>
      </v-btn>
      <v-menu>
        <v-btn slot="activator" icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile>
            <v-list-tile-title>Test 1</v-list-tile-title>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-title>Test 2</v-list-tile-title>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-title>Test 3</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-tree-view v-if="!error" class="tree-nav">
      <v-tree-node v-for="item in items" :key="item.id" :expanded="item.expanded" @expand="$emit('expand', item)" :checked="item.checked" :has-children="item.hasChildren" :level="item.level" :to="toPrefix+item.id" @check="$emit('check', item)">{{item.title}}</v-tree-node>
    </v-tree-view>
    <v-messages class="pa-3" color="error" :value="[error]" v-else></v-messages>

  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import vTreeView from "~/components/TreeView/TreeView.vue";
import vTreeNode from "~/components/TreeView/TreeNode.vue";

export default Vue.extend({
  components: {
    vTreeView,
    vTreeNode
  },
  data() {
    return {};
  },
  props: {
    toPrefix: {
      type: String
    },
    error: {
      type: String
    },
    items: {
      type: Array
    },
    groups: {
      type: Array
    },
    actions: {
      type: Array
    }
  },
  watch: {
    toPrefix: {
      immediate: true,
      handler(val) {}
    }
  }
});
</script>



<style scoped>
.group-title {
  font-size: 16px;
  font-weight: normal;
}
</style>

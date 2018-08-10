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
      <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn>
    </v-toolbar>
    <v-list style="overflow: auto">
      <v-list-tile v-for="item in items" :to="toPrefix+item.id" :key="item.id">
        <v-list-tile-content>
          <v-list-tile-title>
            {{item.title}} ({{item.id}})
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
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
import TreeView from "~/components/TreeNav/TreeView.vue";
const store = namespace("tree");

@Component({
  components: {
    TreeView
  }
})
export default class TreeNav extends Vue {
  treeData = [];
  treeTypes = [];

  @Prop({ type: String })
  toPrefix: string;
  @Prop({ type: Array })
  items: any[];
  @Prop({ type: Array })
  groups: any[];

  @Watch("toPrefix", { immediate: true })
  onPrefixChange(oldVal: string, newVal: string) {}
}
</script>



<style scoped>
.group-title {
  font-size: 16px;
  font-weight: normal;
}
</style>
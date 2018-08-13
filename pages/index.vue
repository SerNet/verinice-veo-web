<template>
  <div>
    <v-tree-view class="tree-nav" :size="48" :root="root" :load-children="getChildren" :has-children="hasChildren" :is-expanded="isExpanded" :meta="meta">
      <v-tree-node slot-scope="{item, meta}" v-bind="item" :expanded="isExpanded(item)" :has-children="hasChildren(item)" @change="onChange(item, $event)"></v-tree-node>
    </v-tree-view>
  </div>
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
import vTreeView from "~/components/TreeView/TreeView.vue";
import vTreeNode from "~/components/TreeView/TreeNode.vue";
import { InternalTreeItem, TreeItem } from "~/store/modules/tree";

const treeStore = namespace("tree");

@Component({
  components: {
    vTreeView,
    vTreeNode
  }
})
export default class Index extends Vue {
  @treeStore.Getter("root") root: any;
  @treeStore.Getter("children") getChildren: (node: any) => any[];
  @treeStore.Getter("meta") meta: Function;
  @treeStore.Getter("hasChildren") hasChildren: (node: any) => boolean;
  @treeStore.Getter("isExpanded") isExpanded: (node: any) => boolean;
  @treeStore.Mutation("setMeta") setMeta: Function;

  async fetch({ store, params }: { store: Store<any>; params: Object }) {
    await store.dispatch("tree/getItems");
  }

  onChange(item: InternalTreeItem, meta: {}) {
    this.setMeta({ id: item.id, meta });
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

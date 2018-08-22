<template>
  <div>welcome</div>
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

const treeStore = namespace("tree");

@Component({
  components: {
    vTreeView,
    vTreeNode
  }
})
export default class Index extends Vue {
  @treeStore.State("items") items: Object[];
  @treeStore.Action("expand") expandItem: Function;
  @treeStore.Action("check") checkItem: Function;

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
}
</style>

<template>
  <virtual-scroll-list v-resize="handleResize" :size="size" :remain="remain" style="height: auto;">
    <tree-node v-for="item in items" :key="item.id" v-bind="item" :checkable="checkable" @toggle="item.open = !item.open"></tree-node>
  </virtual-scroll-list>
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
import VirtualScrollList from "vue-virtual-scroll-list";
import TreeNode from "~/components/TreeView/TreeNode.vue";

const store = namespace("tree");

function convertNode(node: ITreeItem, level: number) {
  return { ...node, open: true, level };
}

function flatten(node: ITreeItem, level: number = 0): any[] {
  return [convertNode(node, level)].concat(
    ...(node.children || []).map(item => flatten(item, level + 1))
  );
}

interface ITreeItem {
  id: string;
  name: string;
  checked: boolean;
  children: ITreeItem[];
}

@Component({
  components: { VirtualScrollList, TreeNode }
})
export default class TreeView extends Vue {
  @Prop({ type: Object })
  root: any;

  @Prop({ type: Boolean, default: false })
  checkable: boolean;

  @Prop({ type: Number, default: 48 })
  size: number;

  remain: number = 20;

  @Watch("size")
  onSizeChanged(val: number) {
    this.handleResize();
  }

  handleResize() {
    this.remain = Math.ceil(this.$el.clientHeight / this.size);
  }

  createItems() {
    const out = [];
    for (let i = 0; i < 100; i++) {
      out.push({
        id: i,
        title: `Item ${i} ${new Array(Math.ceil(Math.random() * 10))
          .fill("bla")
          .join(" ")}`,
        checked: false,
        level: i % 3,
        open: i % 3 != 2
      });
    }
    return out;
  }

  get items() {
    return this.root && flatten(this.root);
  }
}
</script>

<style lang="stylus" scoped>
</style>

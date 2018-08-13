<template>
  <virtual-scroll-list v-resize="handleResize" :size="size" :remain="remain" style="height: auto;">
    <li v-for="item in items" :key="item.id">
      <slot name="default" v-bind:item="item"></slot>
    </li>
  </virtual-scroll-list>
</template>

<script lang="ts">
import {
  Component,
  Inject,
  Model,
  Prop,
  Vue,
  Watch,
  Emit
} from "nuxt-property-decorator";
import { namespace } from "nuxt-class-component";
import VirtualScrollList from "vue-virtual-scroll-list";
import TreeNode from "~/components/TreeView/TreeNode.vue";
import { InternalTreeItem } from "~/store/modules/tree";

const store = namespace("tree");

function convertNode(node: ITreeItem, level: number) {
  return { ...node, level };
}

function _hasChildren(node: ITreeItem) {
  return node.children && node.children.length;
}

function _isExpanded(node: ITreeItem): boolean {
  return node.expanded || false;
}

async function _loadChildren(node: ITreeItem): Promise<ITreeItem[]> {
  return (node && node.children) || [];
}

interface ITreeItem {
  id: string;
  name: string;
  checked?: boolean;
  expanded?: boolean;
  children?: ITreeItem[];
}

@Component({
  components: { VirtualScrollList, TreeNode }
})
export default class TreeView extends Vue {
  @Prop({ type: Object })
  root: ITreeItem;

  @Prop({ type: Boolean, default: false })
  checkable: boolean;

  @Prop({ type: Number, default: 48 })
  size: number;

  @Prop({ type: Function, default: _loadChildren })
  loadChildren: (node: ITreeItem) => ITreeItem[];

  @Prop({ type: Function, default: _isExpanded })
  isExpanded: (node: ITreeItem) => Boolean;

  @Prop({ type: Function, default: _hasChildren })
  hasChildren: (node: ITreeItem) => Promise<ITreeItem[]>;

  @Prop({ type: Function, default: (node: ITreeItem) => node })
  meta: (node: InternalTreeItem) => any;

  @Watch("size")
  onSizeChanged(val: number) {
    this.handleResize();
  }

  @Emit("toggle-item")
  toggleItem(item: ITreeItem) {
    console.log("toggleItem", item);
  }

  remain: number = 20;

  handleResize() {
    this.remain = Math.ceil(this.$el.clientHeight / this.size);
  }

  $flatten(node: ITreeItem, level: number = 0): any[] {
    if (!this.hasChildren(node) || !this.isExpanded(node)) {
      return [convertNode(node, level)];
    } else {
      const children = this.hasChildren(node) ? this.loadChildren(node) : [];
      return [convertNode(node, level)].concat(
        ...children.map(item => this.$flatten(item, level + 1))
      );
    }
  }

  get items() {
    return this.root && this.$flatten(this.root);
  }
}
</script>

<style lang="stylus" scoped>
ul, li {
  list-style: none;
}
</style>

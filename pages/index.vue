<template>
  <div>
    <v-tree-view class="tree-nav" :size="48" :root="root">

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

const treeStore = namespace("tree");

@Component({
  components: {
    vTreeView
  }
})
export default class Index extends Vue {
  @treeStore.Getter("root") root: any;
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

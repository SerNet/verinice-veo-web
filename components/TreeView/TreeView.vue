<template>
  <v-list class="pa-0" v-resize="onResize">
    <virtual-list :size="48" :remain="remain" style="max-height: 100%">
      <slot></slot>
    </virtual-list>
  </v-list>
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
import virtualList from "vue-virtual-scroll-list";

@Component({
  components: {
    virtualList
  }
})
export default class TreeNode extends Vue {
  remain = 10;
  size = 48;

  onResize() {
    this.remain = Math.ceil(this.$el.clientHeight / 48) * 2;
  }
}
</script>


<style lang="stylus" scoped>
.small-action {
  min-width: 30px;
}

.checkbox {
  zoom: 0.8;
}

.chevron.open {
  transform: rotate(90deg);
}
</style>


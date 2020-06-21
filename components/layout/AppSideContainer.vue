<template>
  <div class="sideContainer" :class="side">
    <!--  :style="{width: `${width}px`}" -->
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    width: {
      type: Number,
      default: 300
    },
    visible: {
      type: Boolean,
      default: true
    },
    side: {
      type: String,
      default: 'right'
    }
  }
})
</script>

<style lang="scss" scoped>
.sideContainer {
  overflow: scroll;
  display: block;
  top:0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.left {
  border-right: 1px solid black
}

.right {
  border-left: 1px solid black
}

</style>

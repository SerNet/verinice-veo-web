<template>
  <v-col class="flex-shrink-1 flex-grow-0">
    <div class="sideContainer" :class="side" :style="{width: `${width}px`}">
      <slot />
    </div>
  </v-col>
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
  overflow-y: hidden;
  overflow-x: hidden;
  display: block;
  top:0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.left {
  border-right: 1px solid #e0e0e0
}

.right {
  border-left: 1px solid #e0e0e0
}

</style>

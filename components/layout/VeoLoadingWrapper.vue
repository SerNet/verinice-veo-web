<template>
  <div class="veo-loading-wrapper d-flex align-center justify-center">
    <v-progress-circular
      size="64"
      color="primary"
      indeterminate
    />
    <span
      v-if="text"
      class="font-size: 1.5rem;"
    >{{ text }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    text: {
      type: String,
      default: undefined
    }
  }
});
</script>

<style lang="scss" scoped>
.veo-loading-wrapper {
  background-color: rgba(255, 255, 255, 0.6);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1;
}
</style>

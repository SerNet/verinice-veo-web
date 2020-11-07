<template>
  <div class="veo-loading-wrapper d-flex align-center justify-center">
    <v-progress-circular size="64" color="primary" indeterminate />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
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

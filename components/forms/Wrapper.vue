<template>
  <div class="vf-wrapper d-flex flex-column">
    <slot />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'Wrapper',
  props: {}
})
</script>

<style lang="scss" scoped>
::v-deep {
  button:focus {
    outline: none;
  }
}

.vf-wrapper {
  overflow: auto;
}
</style>

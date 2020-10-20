<template>
  <div class="display-1 font-weight-bold">
    <v-btn fab small to="/help" color="primary" elevation="0">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <span class="pl-2" style="vertical-align:bottom;">
      <slot />
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'PageHeader'
})
</script>

<style lang="scss"></style>

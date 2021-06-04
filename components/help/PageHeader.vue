<template>
  <div class="display-1 font-weight-bold">
    <span
      class="pl-2"
      style="vertical-align:bottom;"
    >
      <slot />
    </span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'PageHeader'
});
</script>

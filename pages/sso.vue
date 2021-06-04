<template>
  <div />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  layout: 'none',
  props: {},
  mounted() {
    parent.postMessage(location.href, location.origin);
  }
});
</script>

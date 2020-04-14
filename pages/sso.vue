<template>
  <div />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  layout: 'plain',
  components: {},
  props: {},
  mounted() {
    parent.postMessage(location.href, location.origin)
  }
})
</script>

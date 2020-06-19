<template>
  <h1>PROCESS.vue {{ $route.params.process }}</h1>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'Process',
  head() {
    return {
      title: 'Forms'
    }
  }
})
</script>

<style lang="scss" scoped></style>

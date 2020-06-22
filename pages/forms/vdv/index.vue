<template>
  <h1>INDEX.vue {{ $route.params.process }}</h1>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'VdvForm',
  head() {
    return {
      title: 'VDV'
    }
  }
})
</script>

<style lang="scss" scoped></style>

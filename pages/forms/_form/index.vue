<template>
  <h1>_form {{ $route.params.form }}</h1>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'Form',
  head() {
    return {
      title: 'Form'
    }
  }
})
</script>

<style lang="scss" scoped></style>

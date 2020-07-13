<template>
  <nuxt-child />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  validate({ params, redirect }) {
    // TODO intelligentere Überprüfung ob params.unit einer echten uuid einer unit entspricht
    if (['undefined', 'data', 'forms', 'settings'].includes(params.unit)) {
      redirect('/')
    }
    return true
  },
  components: {},
  props: {},
  async fetch() {},
  data() {
    return {}
  },
  methods: {}
})
</script>

<style lang="sass" scoped>

</style>

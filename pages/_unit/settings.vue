<template>
  <v-col cols="12">
    <h1>Einstellungen</h1>
    Version: {{ $config.version }}<br>
    Build: {{ $config.build }}
  </v-col>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {},
  async fetch() {
  },
  data() {
    return {}
  },
  methods: {},
  head() {
    return {
      title: 'Einstellungen'
    }
  }
})
</script>

<style lang="scss" scoped>

</style>

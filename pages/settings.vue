<template>
  <v-col cols="12" style="margin: auto;">
    <v-card class="pa-4 text-center">
      I am the settings page
    </v-card>
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

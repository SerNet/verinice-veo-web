<template>
  <v-row>
    <v-col cols="2">
      veo.forms Navigation
      <ul>
        <li><nuxt-link to="/forms/vdv">VDV</nuxt-link></li>
      </ul>
    </v-col>
    <v-col cols="10">
      <nuxt-child />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {},
  props: {},
  fetch({ app }) {},
  data() {
    return {}
  },
  methods: {},
  head() {
    return {
      title: 'Willkommen'
    }
  }
})
</script>

<style lang="scss" scoped>

</style>

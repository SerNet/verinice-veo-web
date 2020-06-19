<template>
  <v-row>
    <v-col cols="2">
      veo.data Navigation
      <ul>
        <li><nuxt-link to="/data/asset">Assets</nuxt-link></li>
        <li><nuxt-link to="/data/control">Controls</nuxt-link></li>
        <!--<li><nuxt-link to="/data/group">Groups</nuxt-link></li>-->
        <!--// Group erstmal deaktiviert, weil das bei fetchAll noch einen type-param benötigt-->
        <li><nuxt-link to="/data/person">Persons</nuxt-link></li>
        <li><nuxt-link to="/data/process">Processes</nuxt-link></li>
        <li><nuxt-link to="/data/unit">Units</nuxt-link></li>
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

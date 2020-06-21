<template>
  <v-container fill-height fluid class="ma-0 pa-0" align-start>
    <v-row no-gutters>
      <AppSideContainer side="left" width="350">
        <v-col>
          veo.data Navigation
          <ul>
            <li><nuxt-link to="/data/asset">Assets</nuxt-link></li>
            <li><nuxt-link to="/data/control">Controls</nuxt-link></li>
            <!--<li><nuxt-link to="/data/group">Groups</nuxt-link></li>
            // Group erstmal deaktiviert, weil das bei fetchAll noch einen type-param benötigt-->
            <li><nuxt-link to="/data/person">Persons</nuxt-link></li>
            <li><nuxt-link to="/data/process">Processes</nuxt-link></li>
            <li><nuxt-link to="/data/unit">Units</nuxt-link></li>
          </ul>
        </v-col>
      </AppSideContainer>

      <v-col class="flex-shrink-0 flex-grow-1">
        <nuxt-child />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import AppSideContainer from '~/components/layout/AppSideContainer.vue'

export default Vue.extend({
  components: {
    AppSideContainer
  },
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

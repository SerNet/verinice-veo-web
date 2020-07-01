<template>
  <v-container fill-height fluid class="ma-0 pa-0" align-start>
    <v-row no-gutters>
      <AppSideContainer side="left" :width="350">
        <v-col cols="12">
          veo.forms Navigation
          <ul>
            <li><nuxt-link to="/forms/07b57947-6259-471e-95cf-5970a40fac3f/">VDV</nuxt-link></li>
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
  methods: {},
  head() {
    return {
      title: 'Willkommen'
    }
  }
})
</script>

<style lang="scss" scoped></style>

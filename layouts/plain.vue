<template>
  <v-app>
    <v-app-bar class="veo-app-bar" app clipped-left flat>
      <div class="d-flex">
        <AppBarLogo class="ml-2" />
      </div>
    </v-app-bar>
    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  head() {
    return {
      titleTemplate: '%s - verinice.veo'
    }
  }
})
</script>
<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-app-bar {
  background-color: white !important;
  box-shadow: inset 0 -1px 0 $grey !important;

  .v-toolbar__content {
    > * {
      flex-grow: 1;
      flex-basis: 0;
    }
  }
}
</style>

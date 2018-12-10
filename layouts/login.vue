<template>
  <v-app>
    <main-toolbar app class="elevation-1" :search="false" @click-side-icon="mainDrawer = !mainDrawer" :clipped="true"></main-toolbar>
    <v-content>
      <v-container text-xs-center fluid>
        <nuxt></nuxt>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import MainToolbar from "~/components/Layout/MainToolbar.vue";
export default Vue.extend({
  components: {
    MainToolbar
  }
});
</script>

<style lang="stylus" scoped>
h1, h2 {
  font-weight: normal;
}

a {
  color: #42b983;
}
</style>

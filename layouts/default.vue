<template>
  <v-app>
    <main-toolbar @click-side-icon="mainDrawer = !mainDrawer" :clipped="true"></main-toolbar>
    <v-navigation-drawer v-model="mainDrawer" :mini-variant="true && $vuetify.breakpoint.smAndUp" :permanent="$vuetify.breakpoint.smAndUp" :clipped="$vuetify.breakpoint.smAndUp" app>
      <menu-sidenav :items="menuItems" />
    </v-navigation-drawer>
    <v-content>
      <v-container fill-height="" fluid pa-0>
        <nuxt></nuxt>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import MainToolbar from "~/components/MainLayout/MainToolbar.vue";
import MenuSidenav from "~/components/MainLayout/MenuSidenav.vue";
import { helpers as navStore } from "~/store/modules/nav";

export default Vue.extend({
  components: {
    MainToolbar,
    MenuSidenav
  },
  computed: {
    ...navStore.mapState({
      menuItems: "items"
    })
  },
  data() {
    return {
      mainDrawer: null,
      msg: "Welcome to MY Vue.js App"
    };
  },
  async mounted() {}
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

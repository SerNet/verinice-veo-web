<template>
  <v-app>
    <main-toolbar @click-side-icon="mainDrawer = !mainDrawer" :clipped="true"></main-toolbar>
    <v-navigation-drawer v-model="mainDrawer" :mini-variant="$vuetify.breakpoint.smAndUp" :permanent="$vuetify.breakpoint.smAndUp" :clipped="$vuetify.breakpoint.smAndUp" app>
      <menu-sidenav/>
    </v-navigation-drawer>
    <v-content>
      <v-container fluid pa-0>
        <nuxt></nuxt>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { mapActions, mapGetters } from "vuex";

import MainToolbar from "~/components/MainLayout/MainToolbar.vue";
import MenuSidenav from "~/components/MainLayout/MenuSidenav.vue";
import TreeNav from "~/components/TreeNav/TreeNav.vue";
import {
  Component,
  Inject,
  Model,
  Prop,
  Vue,
  Watch
} from "nuxt-property-decorator";
import { namespace } from "nuxt-class-component";

@Component({
  components: {
    MainToolbar,
    MenuSidenav,
    TreeNav
  }
})
export default class DefaultLayout extends Vue {
  items = [];
  mainDrawer = null;
  msg = "Welcome to MY Vue.js App";

  created() {
    //this.getItems();
  }
}
</script>

<style lang="stylus" scoped>
h1, h2 {
  font-weight: normal;
}

a {
  color: #42b983;
}
</style>

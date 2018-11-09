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
import MainToolbar from "~/components/MainLayout/MainToolbar.vue";
import MenuSidenav from "~/components/MainLayout/MenuSidenav.vue";
import SidePane from "~/components/Layout/SidePane.vue";
import SidePaneButtons from "~/components/Layout/SidePaneButtons.vue";
import TreeWidget from "~/widgets/Tree.vue";
import { helpers as navStore } from "~/store/modules/nav";
import extendMatch from "~/lib/DynamicComponent";

export default Vue.extend({
  components: {
    MainToolbar,
    MenuSidenav,
    TreeWidget,
    SidePane,
    SidePaneButtons
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

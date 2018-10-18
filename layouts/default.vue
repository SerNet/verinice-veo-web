<template>
  <v-app>
    <v-content>
      <main-toolbar @click-side-icon="mainDrawer = !mainDrawer" :clipped="true"></main-toolbar>
      <side-pane :expanded.sync="leftExpanded" :min-width="300" :width="364" app clipped>
        <component :is="left"></component>
      </side-pane>
      <v-container>
        <nuxt-child param="default"></nuxt-child>
      </v-container>
      <side-pane :expanded.sync="rightExpanded" :width="364" app clipped :right="true">
        <component :is="right"></component>
      </side-pane>
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
  beforeCreate() {
    this["left"] = extendMatch(this, this.$route.query["left"], {
      side: "left"
    });
    this["right"] = extendMatch(this, this.$route.query["right"], {
      side: "right"
    });
  },
  components: {
    MainToolbar,
    MenuSidenav,
    TreeWidget,
    SidePane,
    SidePaneButtons
  },
  data() {
    return {
      leftExpanded: true,
      rightExpanded: true
    };
  },
  methods: {
    log(...args: any[]) {
      console.log(...args);
    }
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

.vue-grid-layout {
  height: 100%;

  >>> .v-toolbar__content {
    height: 44px !important;
  }
}

.vue-grid-item {
  background-color: white;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently supported by Chrome and Opera */
}
</style>

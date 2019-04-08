<template>
  <v-app fill-height>
    <main-toolbar app v-if="!standalone" @click-side-icon="mainDrawer = !mainDrawer" :clipped="true" :clipped-left="false"></main-toolbar>
    <side-pane v-if="!standalone" v-model="mainDrawer" :items="left.items" :width.sync="left.width" :expanded.sync="left.expanded" :route="leftKey"></side-pane>

    <v-content fill-height>
      <v-container fluid class="pa-0" fill-height>
        <nuxt></nuxt>
      </v-container>
    </v-content>
    <side-pane v-if="!standalone" :items="right.items" :width.sync="right.width" :expanded.sync="right.expanded" :route="rightKey" right touchless></side-pane>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import MainToolbar from "~/components/Layout/MainToolbar.vue";
import MenuSidenav from "~/components/Layout/MenuSidenav.vue";
import SidePane from "~/components/Layout/SidePane.vue";

export default Vue.extend({
  components: {
    MainToolbar,
    MenuSidenav,
    SidePane
  },
  computed: {
    standalone(): boolean {
      return !!this.$route.query["standalone"];
    },
    rightOff(): boolean {
      return this.$route.query["r"] == "off";
    },
    leftKey(): string {
      return "/" + (this.$route.query["l"] || "tree");
    },
    rightKey(): string {
      return "/" + (this.$route.query["r"] || "history");
    }
  },
  data() {
    return {
      mainDrawer: true,

      left: {
        expanded: true,
        context: { side: "left" },
        width: 364,
        items: [
          {
            to: { l: "tree", $: "index", r: "history" },
            icon: "folder",
            title: "Einträge"
          },
          {
            to: { l: "setup", $: "settings", r: "off" },
            icon: "settings",
            active: true,
            title: "Einstellungen"
          }
        ]
      },

      right: {
        expanded: true,
        width: 364,
        items: [
          { to: { r: "history" }, icon: "history", title: "Änderungen" },
          { to: { r: "links" }, icon: "link", title: "Links" },
          { to: { r: "preview" }, icon: "collections", title: "Vorschau" }
        ]
      }
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

>>> .v-navigation-drawer {
  transition: none;
}
</style>

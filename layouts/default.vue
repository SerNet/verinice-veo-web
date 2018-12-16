<template>
  <v-app>
    <main-toolbar app v-if="!standalone" @click-side-icon="mainDrawer = !mainDrawer" :clipped="true" :clipped-left="false"></main-toolbar>
    <side-pane v-if="!standalone" v-model="mainDrawer" :query="leftKey" :items="leftItems" :expanded.sync="leftExpanded" :min-width="300" :width="364" app clipped>
      <page-component :route="leftKey" :context="{side: 'left'}">
        <loading-component slot="loading"></loading-component>
      </page-component>
    </side-pane>
    <v-content>
      <v-container class="pa-0">
        <nuxt></nuxt>
      </v-container>
    </v-content>
    <side-pane v-if="!standalone && !rightOff" :query="rightKey" :items="rightItems" :expanded.sync="rightExpanded" :min-width="300" :width="364" app clipped :right="true">
      <page-component :route="rightKey" :context="{side: 'right'}">
        <loading-component slot="loading"></loading-component>
      </page-component>
    </side-pane>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import MainToolbar from "~/components/Layout/MainToolbar.vue";
import MenuSidenav from "~/components/Layout/MenuSidenav.vue";
import SidePane from "~/components/Layout/SidePane.vue";
import SidePaneButtons from "~/components/Layout/SidePaneButtons.vue";
import LoadingComponent from "~/components/LoadingComponent.vue";
import PageComponent from "~/components/PageComponent.vue";

export default Vue.extend({
  components: {
    MainToolbar,
    MenuSidenav,
    SidePane,
    SidePaneButtons,
    PageComponent,
    LoadingComponent
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
    /*left(): any {
      return extendMatch(this, this.leftKey, {
        side: "left"
      });
    },
    right(): any {
      return extendMatch(this, this.rightKey, {
        side: "right"
      });
    }*/
  },
  data() {
    return {
      mainDrawer: true,
      leftItems: [
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
      ],
      rightItems: [
        { to: { r: "history" }, icon: "history", title: "Änderungen" },
        { to: { r: "links" }, icon: "link", title: "Links" },
        { to: { r: "preview" }, icon: "collections", title: "Vorschau" }
      ],
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
</style>

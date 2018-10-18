<template>
  <v-app>
    <v-content>
      <main-toolbar @click-side-icon="mainDrawer = !mainDrawer" :clipped="true"></main-toolbar>
      <side-pane query="l" :items="leftItems" :expanded.sync="leftExpanded" :min-width="300" :width="364" app clipped>
        <template>
          <keep-alive>
            <component :key="leftKey" :is="left"></component>
          </keep-alive>
        </template>
      </side-pane>
      <v-container style="border-top: 1px solid #E0E0E0">
        <nuxt-child></nuxt-child>
      </v-container>
      <side-pane v-if="!rightOff" query="r" :items="rightItems" :expanded.sync="rightExpanded" :width="364" app clipped :right="true">
        <keep-alive>
          <component :key="rightKey" :is="right"></component>
        </keep-alive>
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
  components: {
    MainToolbar,
    MenuSidenav,
    TreeWidget,
    SidePane,
    SidePaneButtons
  },
  computed: {
    leftKey(): string {
      return this.$route.query["l"];
    },
    rightKey(): string {
      return this.$route.query["r"];
    },
    left(): any {
      return extendMatch(this, this.leftKey, {
        side: "left"
      });
    },
    right(): any {
      return extendMatch(this, this.rightKey, {
        side: "right"
      });
    },
    rightOff(): boolean {
      return this.$route.query["r"] == "off";
    }
  },
  watch: {
    $route: {
      handler(v) {},
      immediate: true
    }
  },
  data() {
    return {
      leftItems: [
        { to: { l: "tree", $: "index", r: "history" }, icon: "folder" },
        {
          to: { l: "setup", $: "settings", r: "off" },
          icon: "settings",
          active: true
        }
      ],
      rightItems: [
        { to: { r: "history" }, icon: "history" },
        { to: { r: "preview" }, icon: "collections" },
        { to: { r: "links" }, icon: "link" }
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

<template>
  <v-app>
    <main-toolbar @click-side-icon="mainDrawer = !mainDrawer" :clipped="true"></main-toolbar>
    <v-navigation-drawer v-model="mainDrawer" :mini-variant="$vuetify.breakpoint.smAndUp" :permanent="$vuetify.breakpoint.smAndUp" :clipped="$vuetify.breakpoint.smAndUp" app>
      <menu-sidenav :items="menuItems" />
    </v-navigation-drawer>
    <v-content>
      <v-container pa-0 ma-0 ref="contentContainer" v-resize="onResize" style="width: 100%; position: absolute; top: 0; bottom: 0; max-width: 100%; overflow: hidden;">
        <no-ssr>
          <grid-layout :layout="layout" :col-num="gridOptions.colNum" :row-height="gridOptions.rowHeight" :max-rows="gridOptions.maxRows" :margin="[gridOptions.marginX, gridOptions.marginY]" :is-draggable="true" :is-resizable="true" :vertical-compact="true" :use-css-transforms="true">
            <grid-item v-for="item in layout" :key="item.i" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i" :min-w="2" :min-h="2" @resize="resizeEvent" @move="moveEvent" drag-allow-from=".widgetToolbar" class="elevation-1">
              <v-toolbar class="widgetToolbar elevation-0">{{item.caption}}</v-toolbar>
              <v-container>{{item.i}}: {{item.content}}</v-container>
            </grid-item>
          </grid-layout>
        </no-ssr>
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
  mounted() {
    this.onResize();
  },
  data() {
    return {
      mainDrawer: null,
      layout: [
        {
          i: "0",
          x: 0,
          y: 0,
          w: 2,
          h: 12,
          caption: "Treeview",
          content: "Test 12"
        },
        {
          i: "1",
          x: 2,
          y: 0,
          w: 8,
          h: 5,
          caption: "Editor",
          content: "Test XYZ"
        },
        {
          i: "2",
          x: 10,
          y: 0,
          w: 2,
          h: 6,
          caption: "Preview",
          content: "Test XYZ"
        }
      ],
      gridHeight: "100%",
      gridOptions: {
        colNum: 12,
        rowHeight: 44,
        maxRows: 12,
        marginX: 10,
        marginY: 10
      }
    };
  },
  methods: {
    onResize() {
      const elem = this.$refs["contentContainer"] as Element;
      this.gridHeight = elem.clientHeight + "px";
      this.gridOptions.rowHeight =
        (elem.clientHeight -
          (this.gridOptions.maxRows + 1) * this.gridOptions.marginY) /
        this.gridOptions.maxRows;
    },
    resizeEvent(
      i: string,
      newH: number,
      newW: number,
      newHPx: number,
      newWPx: number
    ) {
      console.log("RESIZED i=" + i + ", H=" + newH + ", W=" + newW);
      console.log(this.layout[i]);
    },
    moveEvent(i: string, newX: number, newY: number) {
      console.log("MOVED i=" + i + ", X=" + newX + ", Y=" + newY);
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

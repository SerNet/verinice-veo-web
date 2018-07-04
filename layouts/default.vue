<template>
  <v-app>
    <main-toolbar @click-side-icon="mainDrawer = !mainDrawer" :clipped="true"></main-toolbar>
    <v-navigation-drawer v-model="mainDrawer" :mini-variant="$vuetify.breakpoint.smAndUp"
                         :permanent="$vuetify.breakpoint.smAndUp" :clipped="$vuetify.breakpoint.smAndUp" app>
      <menu-sidenav/>
    </v-navigation-drawer>
    <v-content>
      <v-container fluid pa-0>
        <v-layout>
          <v-flex xs3>
            <tree-nav></tree-nav>
          </v-flex>
        </v-layout>
        <ul>
          <li v-for="(item,i) in items" :key="i">{{item.typeId}}: {{item.date || item.number ||item.text}}</li>
        </ul>
      </v-container>
    </v-content>
  </v-app>
</template>
<script lang="ts">
import { mapActions, mapGetters } from "vuex";

import MainToolbar from "~/components/MainLayout/MainToolbar.vue";
import MenuSidenav from "~/components/MainLayout/MenuSidenav.vue";
import TreeNav from "~/components/TreeNav/TreeNav.vue";
import { Component, Inject, Model, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { namespace } from 'nuxt-class-component'
const treeStore = namespace('tree')

@Component({
  components: {
    MainToolbar,
    MenuSidenav,
    TreeNav
  }
})
export default class DefaultLayout extends Vue {
  @treeStore.Action getItems: () => Promise<any>

  items = []
  mainDrawer = null
  msg = "Welcome to MY Vue.js App"

  created() {
    //this.getItems();
    this.getItems();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>

h1, h2 {
  font-weight: normal;
}

a {
  color: #42b983;
}
</style>
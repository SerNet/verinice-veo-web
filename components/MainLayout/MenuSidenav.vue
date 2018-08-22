<template>
  <v-list class="main-sidenav-content">
    <v-list-tile class="list-tile" v-for="(item, i) in items" :class="['item', item.active?'active':'inactive']" :key="i" :to="item.to">
      <v-list-tile-action>
        <v-icon class="icon" v-html="item.icon" />
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title v-text="item.title" />
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>
<style lang="stylus">
.main-sidenav-content {
  .list-tile.active {
    // border-left: 4px solid $vuetify.theme.primary;
    background: #F0F0F0;
  }
}
</style>
<script lang="ts">
import {
  Component,
  Inject,
  Model,
  Prop,
  Vue,
  Watch
} from "nuxt-property-decorator";
import { namespace } from "nuxt-class-component";
import { NavItem } from "~/store/modules/nav";
const store = namespace("nav");

@Component
export default class MenuSidenav extends Vue {
  @store.State("items") items: Array<NavItem>;

  created() {}
}
</script>

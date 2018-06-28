<template>
  <v-list class="main-sidenav-content">
    <v-list-tile class="list-tile" v-for="(item, i) in items" :class="['item', item.active?'active':'inactive']"
                 :key="i">
      <v-list-tile-action>
        <v-icon class="icon" v-html="item.icon"/>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title v-text="item.title"/>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>
<style lang="stylus">

  .main-sidenav-content {
    .list-tile.active {
      //border-left: 4px solid $vuetify.theme.primary;
      background: #F0F0F0;
    }
  }
</style>
<script lang="typescript">
  import {mapActions, mapGetters} from "vuex";

  export default {
    methods: mapActions({
      getNavigation: 'nav/getItems'
    }),
    computed: mapGetters({
      items: 'nav/items'
    }),
    created() {
      this.getNavigation()
    }
  };
</script>

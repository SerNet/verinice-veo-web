<template>
  <v-flex text-xs-left style="max-width: 100%; position: absolute;">
    <h3 class="grey--text pa-2">Links</h3>
    <v-list two-line>
      <template v-for="(item, index) in items">
        <v-divider v-if="item.divider" :inset="item.inset" :key="index"></v-divider>
        <v-list-tile v-else :key="item.title" avatar @click.stop="">
          <v-list-tile-avatar color="grey">
            <span class="white--text headline">L</span>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title v-html="item.title"></v-list-tile-title>
            <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>
  </v-flex>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {},
  methods: {},
  components: {},
  data() {
    return {
      items: [
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
          title: "Application Gateway",
          subtitle: "Abhängigkeit"
        },
        { divider: true, inset: true },
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/2.jpg",
          title: "Auftrags- und Kundenverwaltung",
          subtitle: ""
        }
      ]
    };
  }
});
</script>

<style lang="stylus" scoped>
</style>

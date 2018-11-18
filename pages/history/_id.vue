<template>
  <v-layout row fill-height>
    <v-flex text-xs-left class="pa-2">
      <h3 class="grey--text mb-2">Änderungen</h3>
      <v-list two-line v-if="items && items.length > 0">
        <template v-for="(item, index) in items">
          <v-divider v-if="index!=0" inset :key="index"></v-divider>
          <v-list-tile :key="item.title" avatar @click.stop="">

            <v-list-tile-avatar class="avatar-with-badge" color="grey">
              <span class="white--text headline">L</span>
            </v-list-tile-avatar>

            <v-list-tile-content class="list-item-content">
              <v-list-tile-title v-html="item.title"></v-list-tile-title>
              <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
      <div class="ma-3 text-xs-center" style="color: #333" v-else>
        Es sind keine Änderungen vorhanden.
      </div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {},
  methods: {},
  components: {},
  data() {
    return {
      items: []
    };
  }
});
</script>

<style lang="stylus" scoped>
</style>

<template>
  <v-layout row fill-height>
    <v-flex text-xs-left class="pa-2">
      <h3 class="grey--text mb-2">Links</h3>
      <v-list two-line v-if="links && links.length > 0">
        <template v-for="(link, index) in links">
          <link-list-item :key="link.id" :element="item" :link="link" :index="index"></link-list-item>
        </template>
      </v-list>
      <div class="ma-3 text-xs-center" style="color: #333" v-else-if="links && links.length == 0">Es sind keine Links vorhanden.</div>
      <div class="ma-3 text-xs-center" style="color: #999" v-else>Links werden geladen...</div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { helpers as elementsStore } from "~/store/elements";
import { helpers as activeElement } from "~/store/elements/active";

import LinkListItem from "~/components/Links/LinkListItem.vue";

export default Vue.extend({
  props: {},
  methods: {},
  components: {
    LinkListItem
  },
  computed: {
    ...activeElement.mapGetters({
      item: "item",
      links: "links"
    })
  },
  async fetch({ store, query: { type, parent }, params: { id } }) {
    if (id) {
      //TODO: When opened standalone, item might not have been loaded
      await activeElement.dispatch("fetchLinks", { id });
    }
  }
});
</script>

<style lang="stylus" scoped>
</style>

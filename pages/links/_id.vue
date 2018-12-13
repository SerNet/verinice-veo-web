<template>
  <v-layout row fill-height>
    <v-flex text-xs-left class="pa-2">
      <h3 class="grey--text mb-2">Links</h3>
      <v-list two-line v-if="links">
        <template v-for="(link, index) in links" v-if="links.length > 0">
          <link-list-item :key="link['$veo.id']" :element="item" :link="link" :index="index"></link-list-item>
        </template>

        <div class="ma-3 text-xs-center" style="color: #333" v-else>Es sind keine Links vorhanden.</div>
      </v-list>
      <div class="ma-3 text-xs-center" style="color: #333" v-else>Links werden geladen...</div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { helpers as formHelpers } from "~/store/form";
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
    await activeElement.dispatch("fetchItem", { id });
  }
});
</script>

<style lang="stylus" scoped>
</style>

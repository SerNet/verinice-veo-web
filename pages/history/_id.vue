<template>
  <v-layout row fill-height>
    <v-flex text-xs-left class="pa-2">
      <h3 class="grey--text mb-2">Änderungen</h3>
      <v-list two-line v-if="history && history.length > 0">
        <template v-for="(version, index) in history">
          <history-list-item :key="version.id" :version="version" :index="index"></history-list-item>
        </template>
      </v-list>
      <div class="ma-3 text-xs-center" style="color: #333" v-else>Es sind keine Änderungen vorhanden.</div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { helpers as formHelpers } from "~/store/form";
import { helpers as elementsStore } from "~/store/elements";
import { helpers as activeElement } from "~/store/elements/active";

import HistoryListItem from "~/components/History/HistoryListItem.vue";

export default Vue.extend({
  props: {},
  methods: {},
  components: {
    HistoryListItem
  },
  computed: {
    ...activeElement.mapGetters({
      item: "item",
      history: "history"
    })
  },
  async fetch({ store, query: { type, parent }, params: { id } }) {
    if (id) {
      await activeElement.dispatch("fetchItem", { id });
    }
  }
});
</script>

<style lang="stylus" scoped>
</style>

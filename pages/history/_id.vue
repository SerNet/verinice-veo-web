<template>
  <v-layout row fill-height>
    <v-flex text-xs-left class="pa-2">
      <h3 class="grey--text mb-2">Änderungen</h3>
      <v-list two-line v-if="history && history.length > 0">
        <template v-for="(value, index) in history">
          <history-list-item :key="value.id" :value="value" :index="index" :to="`/editor/${item && item.id}/diff/${value.id}`"></history-list-item>
        </template>
      </v-list>
      <div class="ma-3 text-xs-center" style="color: #333" v-else>Es sind keine Änderungen vorhanden.</div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";

import elementsStore from "~/store/elements";
import activeElementStore from "~/store/elements/active";
import {
  mapState,
  mapGetters,
  mapActions,
  useStore
} from "vuex-typesafe-class";

import HistoryListItem from "~/components/History/HistoryListItem.vue";

export default Vue.extend({
  props: {},
  methods: {},
  components: {
    HistoryListItem
  },
  computed: {
    ...mapGetters(activeElementStore, {
      item: "item",
      history: "history"
    })
  },
  async fetch({ store, query, params }) {
    const id = params.id;
    if (id) {
      await useStore(activeElementStore, store).fetchItem({ id });
    }
  }
});
</script>

<style lang="stylus" scoped></style>

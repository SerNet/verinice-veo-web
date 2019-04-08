<template>
  <v-layout row fill-height>
    <v-flex text-xs-left class="pa-2">
      <h3 class="grey--text mb-2">Links</h3>
      <v-list two-line v-if="links && links.length > 0">
        <template v-for="(link, index) in links">
          <link-list-item :key="link.id" :element="item" :link="link" :index="index" @remove="removeLink(link)"></link-list-item>
        </template>
      </v-list>
      <div class="ma-3 text-xs-center" style="color: #333" v-else-if="links && links.length == 0">Es sind keine Links vorhanden.</div>
      <div class="ma-3 text-xs-center" style="color: #999" v-else>Links werden geladen...</div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";

import elementsStore from "~/store/elements";
import linksStore from "~/store/links";
import activeElementStore from "~/store/elements/active";
import {
  mapState,
  mapGetters,
  mapActions,
  useStore
} from "vuex-typesafe-class";
import { UUID } from "~/types/api";

import LinkListItem from "~/components/Links/LinkListItem.vue";

export default Vue.extend({
  props: {},
  components: {
    LinkListItem
  },
  computed: {
    ...mapGetters(activeElementStore, {
      item: "item",
      links: "links"
    })
  },
  methods: {
    ...mapActions(activeElementStore, { _fetchLinks: "fetchLinks" }),
    ...mapActions(linksStore, { _removeLink: "remove" }),
    async fetchLinks() {
      const id = this.$route.params.id;
      return await this._fetchLinks({ id });
    },
    async removeLink({ id }: { id: UUID }) {
      try {
        await this._removeLink({ id });
      } finally {
        await this.fetchLinks();
      }
    }
  },
  async fetch({ store, query, params }) {
    if (params.id) {
      //TODO: When opened standalone, item might not have been loaded
      await useStore(activeElementStore, store).fetchLinks({ id: params.id });
    }
  }
});
</script>

<style lang="stylus" scoped></style>

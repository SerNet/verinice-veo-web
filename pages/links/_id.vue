<template>
  <v-layout row fill-height>
    <v-flex text-xs-left class="pa-2">
      <h3 class="grey--text mb-2">Links</h3>
      <v-list two-line v-if="items && items.length > 0">
        <template v-for="(item, index) in items">
          <v-divider v-if="index!=0" inset :key="index"></v-divider>
          <v-list-tile :key="item.title" avatar @click.stop>
            <v-badge :color="inbound?'green':'blue'" right bottom overlap>
              <v-icon slot="badge" dark small>{{item.inbound?'arrow_forward':'arrow_back'}}</v-icon>
              <v-list-tile-avatar class="avatar-with-badge" color="grey">
                <span class="white--text headline">L</span>
              </v-list-tile-avatar>
            </v-badge>
            <v-list-tile-content class="list-item-content">
              <v-list-tile-title v-html="item.title"></v-list-tile-title>
              <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
      <div class="ma-3 text-xs-center" style="color: #333" v-else>Es sind keine Links vorhanden.</div>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { helpers as formStore } from "~/store/modules/form";
import { helpers as elementsStore } from "~/store/modules/elements";
import { VeoLink } from "api";

export default Vue.extend({
  props: {},
  methods: {},
  components: {},
  computed: {
    ...elementsStore.mapState({
      elements: "items"
    }),
    ...formStore.mapState({
      links: "links"
    }),
    items(): any[] {
      const id = this.$route.params.id;
      return this.links.map((link: VeoLink) => {
        const inbound = link.source == id;
        const source = this.elements[link.source];
        const target = this.elements[link.target];
        return {
          inbound,
          source,
          target,
          title: inbound ? source && source.title : target && target.title,
          subtitle: link.schema
        };
      });
    }
  },
  async fetch({ params, store }) {
    await store.dispatch("form/loadLinks", { id: params.id });
  }
});
</script>

<style lang="stylus" scoped>
.avatar-with-badge {
  min-width: 40px;
}

.list-item-content {
  margin-left: 16px;
}
</style>

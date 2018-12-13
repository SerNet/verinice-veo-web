<template>
  <v-flex class="linkListItem" shrink>
    <v-divider v-if="index!=0" inset :key="index"></v-divider>
    <v-list-tile :key="link.title" avatar :to="to">
      <v-badge :color="inbound?'green':'blue'" right bottom overlap>
        <v-icon slot="badge" dark small>{{inbound?'arrow_forward':'arrow_back'}}</v-icon>
        <v-list-tile-avatar class="avatar-with-badge" color="grey">
          <span class="white--text headline">{{title[0]}}</span>
        </v-list-tile-avatar>
      </v-badge>
      <v-list-tile-content class="list-item-content">
        <v-list-tile-title>{{title}}</v-list-tile-title>
        <v-list-tile-sub-title>{{subtitle}}</v-list-tile-sub-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-flex>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue/types/options";
import { AppElement, AppLink } from "~/types/app";

export default Vue.extend({
  props: {
    element: { type: Object as Prop<AppElement> },
    link: { type: Object as Prop<AppLink>, default: {} as AppLink },
    index: { type: Number }
  },
  methods: {},
  computed: {
    title(): string {
      const link = this.link;
      return this.inbound
        ? link.source
          ? link.source.title
          : link.sourceId
        : (link.target ? link.target.title : link.targetId) || "";
    },
    subtitle(): string {
      return this.link.type;
    },
    inbound(): boolean {
      return this.element.id == this.link.targetId;
    },
    to(): string {
      const toId = this.inbound ? this.link.sourceId : this.link.targetId;
      return "/editor/" + toId;
    }
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

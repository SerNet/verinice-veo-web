<template>
  <v-flex class="historyListItem" shrink>
    <v-divider v-if="index!=0" inset :key="index"></v-divider>
    <v-list-tile :key="version.timestamp" avatar :to="to">
      <v-badge :color="type?'green':'blue'" right bottom overlap>
        <v-icon slot="badge" dark small>{{type?'arrow_forward':'arrow_back'}}</v-icon>
        <v-list-tile-avatar class="avatar-with-badge" color="grey">
          <span class="white--text headline">V</span>
          <!-- TODO -->
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

export default Vue.extend({
  props: {
    version: { type: Object, default: {} },
    index: { type: Number }
  },
  methods: {},
  computed: {
    title(): string {
      return "title";
    },
    subtitle(): string {
      return "subtitle";
    },
    type(): string {
      return "";
    },
    to(): string {
      const toId = "test";
      return "/diff/" + toId;
    },
    data(): object {
      return {};
    },
    author(): string {
      return this.version.author;
    },
    time(): string {
      return this.version.timestamp;
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

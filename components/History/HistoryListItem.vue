<template>
  <v-flex class="historyListItem" shrink>
    <v-divider v-if="index!=0" inset :key="index"></v-divider>
    <v-list-tile avatar :to="to">
      <!--<v-badge :color="type?'green':'blue'" right bottom overlap>
      <v-icon slot="badge" dark small>{{type?'arrow_forward':'arrow_back'}}</v-icon>-->
      <v-list-tile-avatar class="avatar-with-badge" color="grey">
        <span class="white--text headline">{{subtitle.substr(0,1).toUpperCase()}}</span>
        <!-- TODO -->
      </v-list-tile-avatar>
      <!--</v-badge>-->
      <v-list-tile-content class="list-item-content">
        <v-list-tile-title>{{title}}</v-list-tile-title>
        <v-list-tile-sub-title>{{subtitle}}</v-list-tile-sub-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-flex>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import { AppHistory } from "types/app";

export default Vue.extend({
  props: {
    value: { type: Object as () => AppHistory, default: {} as AppHistory },
    index: { type: Number },
    to: { type: String }
  },
  methods: {},
  computed: {
    title(): string {
      const t = moment(this.time);
      return t.format("DD.MM.YYYY") + ", " + t.format("HH:mm:ss");
    },
    subtitle(): string {
      return this.value.author;
    },
    type(): string {
      return "";
    },
    data(): object {
      return {};
    },
    author(): string {
      return this.value.author;
    },
    time(): string {
      return this.value.timestamp;
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

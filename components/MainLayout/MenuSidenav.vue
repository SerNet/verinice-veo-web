<template>
  <v-list class="main-sidenav-content">
    <v-list-tile class="list-tile" v-for="(item, i) in items" :class="['item', item.active?'active':'inactive']" :key="i" :to="item.to">
      <v-list-tile-action>
        <v-icon class="icon" v-html="item.icon" />
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title v-text="item.title" />
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>
<style lang="stylus">
.main-sidenav-content {
  .list-tile.active {
    background: #F0F0F0;
  }
}
</style>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    items: {
      type: Array
    }
  }
});
</script>

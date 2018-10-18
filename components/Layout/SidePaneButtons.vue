<template>
  <v-bottom-nav class="elevation-0 mr-3" :value="true" absolute color="transparent">
    <v-btn flat value="recent">
      <span>Anlegen</span>
      <v-icon>add</v-icon>
    </v-btn>
    <v-btn flat value="recent">
      <span>Alles markieren</span>
      <v-icon>check_box</v-icon>
    </v-btn>
    <v-menu top left offset-y>
      <v-btn flat class="menubtn" slot="activator">
        <v-icon>more_vert</v-icon>
      </v-btn>
      <v-list dense>
        <v-list-tile @click.stop="">
          Langer Text abcdef
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-bottom-nav>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({});
</script>

<style lang="stylus" scoped>
>>> .v-menu__activator {
  height: 100%;
}

>>> .v-bottom-nav .v-btn {
  padding-left: 0;
  padding-right: 0;

  .v-btn-content {
  }
}

.menubtn {
  height: 100%;
  $w = 56px;
  min-width: $w;
  width: $w;
  max-width: $w;
}
</style>


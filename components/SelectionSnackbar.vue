<template>
    <v-snackbar class="snackbar" :value="selection && selection.length > 0" :timeout="0">
        <span>{{selection.length}} Elemente</span>
        <v-menu top left offset-y>
            <v-btn slot="activator" icon flat @click="snackbar = false">
                <v-icon>more_vert</v-icon>
            </v-btn>
            <v-list>
                <template v-for="(action, index) in actions">
                    <v-list-tile @click="$emit('action',action)" :disabled="!action.id" :key="index">
                        <v-list-tile-title>{{ action.title }}</v-list-tile-title>
                    </v-list-tile>
                    <v-divider v-if="action.divide" :key="index+'.divide'"></v-divider>
                </template>

            </v-list>
        </v-menu>
    </v-snackbar>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {};
  },
  props: {
    selection: {
      type: Array
    },
    actions: {
      type: Array,
      default: () => []
    }
  }
});
</script>

<style lang="stylus" scoped>
.snackbar {
    left: auto;
    right: auto;
    bottom: 5px;

    >>> .v-snack__content {
        padding-right: 8px;
    }
}
</style>

<template>
  <v-navigation-drawer
    :value="value"
    @input="$emit('input', $event)"
    :mini-variant="!expanded"
    :mini-variant-width="64"
    :width="width"
    app
    v-resizeable="364"
    @resize="$emit('update:width', $event.width)"
    :right="right"
    :touchless="touchless"
    :class="{collapsed: !expanded}"
    clipped
  >
    <side-pane-content :value="expanded" @input="$emit('update:expanded', $event)" :query="route" :items="items" :right="right">
      <page-component :route="route" :context="{side: right?'right':'left'}">
        <loading-component slot="loading"></loading-component>
      </page-component>
    </side-pane-content>
  </v-navigation-drawer>
</template>
<script lang="ts">
import Vue from "vue";
import SidePaneContent from "~/components/Layout/SidePaneContent.vue";
import LoadingComponent from "~/components/LoadingComponent.vue";
import PageComponent from "~/components/PageComponent.vue";
import Resizeable from "~/directives/resizeable.ts";

export default Vue.extend({
  components: {
    SidePaneContent,
    LoadingComponent,
    PageComponent
  },
  directives: {
    Resizeable
  },
  props: {
    right: {
      type: Boolean,
      default: false
    },
    route: {
      type: String
    },
    items: {
      type: Array
    },
    width: {
      type: Number
    },
    expanded: {
      type: Boolean
    },
    value: {
      type: Boolean,
      default: true
    },
    touchless: {
      type: Boolean
    }
  },
  data() {
    return {};
  }
});
</script>

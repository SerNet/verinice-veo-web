<template>
  <v-toolbar class="breadcrumb-toolbar" color="elevation-0" style="overflow: hidden;" dense>
    <v-breadcrumbs class="breadcrumbs" justify-start="" divider="&gt;">
      <v-breadcrumbs-item class="breadcrumb-item" :to="'/elements/'+(item && item.id)" ripple v-for="item in items" :key="item.id">
        <slot v-bind="item"></slot>
      </v-breadcrumbs-item>
    </v-breadcrumbs>
  </v-toolbar>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    items: {
      type: Array
    }
  },
  methods: {
    changeBreadcrumb(item: any) {
      this.$emit("change", item);
    }
  }
});
</script>

<style lang="stylus" scoped>
.breadcrumb-toolbar {
  z-index: 1;

  .breadcrumbs {
    flex-wrap: nowrap;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0px;
    bottom: 0;

    .breadcrumb-item {
      min-width: 50px;

      a {
        display: block !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 12px 8px;
      }
    }

    li.breadcrumbs__divider {
      padding: 0 2px;
    }
  }
}
</style>

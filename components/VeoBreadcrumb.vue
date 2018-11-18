<template>
  <v-flex class="breadcrumb-toolbar" color="elevation-0" style="overflow: hidden;" shrink>
    <v-breadcrumbs :items="value" class="breadcrumbs" justify-start="" divider="&gt;">
      <slot slot="item" slot-scope="item" v-bind="item"></slot>
    </v-breadcrumbs>
    <slot name="tools"></slot>
  </v-flex>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    value: {
      type: Array as () => { id: string }[]
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
  padding-bottom: 10px;
  background-color: transparent;

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

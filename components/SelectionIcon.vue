<template>
  <v-btn class="btn ml-1 mr-2" :class="{selected: value!==false, indeterminate}" @click="$emit('change', !value)" icon dark small>
    <slot></slot>
    <v-icon :size="16" class="selection-icon">{{deep?'done_all':(indeterminate?'remove':'done')}}
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      hovered: false
    };
  },
  props: {
    size: { type: Number, default: 34 },
    deep: { type: Boolean, default: false },
    indeterminate: { type: Boolean, default: false },
    value: { type: Boolean, required: false }
  }
});
</script>

<style lang="stylus" scoped>
.btn {
  background-color: #DDD;

  .selection-icon {
    display: none;
  }

  &.indeterminate {
    opacity: 0.3;
  }

  &.hover {
    opacity: 0.5 !important;
  }

  &.selected, &:hover {
    background-color: theme.primary;

    >>> .v-icon {
      display: none;
    }

    .selection-icon {
      display: inline-flex !important;
    }
  }
}
</style>

<template>
  <v-btn
    class="collapse-button px-0"
    :class="{'collapse-button--right': right}"
    small
    elevation="0"
    @click="$emit('input', !value)"
  >
    <v-icon>{{ value !== right ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
  </v-btn>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'CollapseButton',
  props: {
    value: {
      // true if collapsed
      type: Boolean
    },
    right: {
      type: Boolean,
      default: false
    }
  }
});
</script>

<style lang="scss" scoped>
.collapse-button {
  position: absolute !important;
  min-width: 35px !important;

  top: 0;

  &:not(.collapse-button--right) {
    left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}

.collapse-button--right {
  right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
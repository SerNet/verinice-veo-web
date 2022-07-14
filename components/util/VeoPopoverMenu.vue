<template>
  <v-menu
    :close-on-content-click="false"
    :nudge-width="0"
    bottom
    offset-y
    rounded="lg"
    max-width="300"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template
      v-if="!!$scopedSlots.activator"
      #activator="slotListeners"
    >
      <slot
        name="activator"
        v-bind="slotListeners"
      />
    </template>
    <v-card
      flat
      class="text-body-2"
    >
      <slot />
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    return {};
  }
});
</script>
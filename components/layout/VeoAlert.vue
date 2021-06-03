<template>
  <v-alert
    :value="value"
    :color="alertColor"
    colored-border
    border="left"
    :elevation="flat ? 0 : 4"
    dense
    class="veo-alert"
    :icon="alertIcon"
  >
    <v-row
      no-gutters
      class="justify-lg-space-between"
    >
      <v-col
        cols="auto"
        class="accent--text"
      >
        <h3 v-text="title" />
        <slot />
        <p
          v-if="text"
          class="mb-0 accent--text"
          v-text="text"
        />
      </v-col>
      <v-col
        v-if="!noCloseButton"
        cols="auto"
        class="ml-6 align-self-center"
      >
        <slot name="additional-button" />
        <v-btn
          outlined
          text
          :color="alertColor"
          @click="$emit('input', false)"
        >
          <span v-if="saveButtonText">{{ saveButtonText }}</span>
          <span v-else>{{ $t('global.button.ok') }}</span>
        </v-btn>
      </v-col>
    </v-row>
  </v-alert>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue/types/options';
import { ALERT_TYPE } from '~/types/VeoGlobalEvents';

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: undefined
    },
    title: {
      type: String,
      default: undefined
    },
    type: {
      type: Number as Prop<ALERT_TYPE>,
      default: 1
    },
    flat: {
      type: Boolean,
      default: false
    },
    noCloseButton: {
      type: Boolean,
      default: false
    },
    saveButtonText: {
      type: String,
      default: undefined
    }
  },
  computed: {
    alertColor(): string {
      switch (this.type) {
        case 0:
          return 'primary';
        case 1:
          return 'primary';
        case 2:
          return 'success';
        case 3:
          return 'warning';
        default:
          return 'primary';
      }
    },
    alertIcon(): string {
      switch (this.type) {
        case 0:
          return 'mdi-alert-circle-outline';
        case 1:
          return 'mdi-information-outline';
        case 2:
          return 'mdi-check-circle-outline';
        case 3:
          return 'mdi-alert-circle-outline';
        default:
          return 'mdi-information-outline';
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.veo-alert ::v-deep i {
  align-self: center;
}
</style>

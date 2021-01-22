<template>
  <v-alert
    :value="value"
    :type="alertType"
    colored-border
    border="left"
    elevation="4"
    dense
    class="veo-alert"
    :icon="alertIcon"
  >
    <v-row no-gutters class="justify-lg-space-between">
      <v-col cols="auto" class="accent--text">
        <h3 v-text="title" />
        <slot />
        <p v-if="text" class="mb-0 accent--text" v-html="text" />
      </v-col>
      <v-col cols="auto" class="ml-6 align-self-center">
        <slot name="additional-button" />
        <v-btn outlined text :color="alertType" @click="$emit('input', false)">
          <span v-if="saveButtonText">{{ saveButtonText }}</span>
          <span v-else>{{ $t('global.button.ok') }}</span>
        </v-btn>
      </v-col>
    </v-row>
  </v-alert>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'

export enum ALERT_TYPE {
  ERROR,
  INFO,
  SUCCESS,
  WARNING
}

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
    saveButtonText: {
      type: String,
      default: undefined
    }
  },
  computed: {
    alertType(): string {
      switch (this.type) {
        case 0:
          return 'error'
        case 1:
          return 'info'
        case 2:
          return 'success'
        case 3:
          return 'warning'
        default:
          return 'info'
      }
    },
    alertIcon(): string {
      switch (this.type) {
        case 0:
          return 'mdi-alert-circle-outline'
        case 1:
          return 'mdi-information-outline'
        case 2:
          return 'mdi-check-circle-outline'
        case 3:
          return 'mdi-alert-circle-outline'
        default:
          return 'mdi-information-outline'
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.veo-alert ::v-deep i {
  align-self: center;
}
</style>

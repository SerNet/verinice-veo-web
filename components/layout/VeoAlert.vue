<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
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
        cols="auto"
        class="align-self-center"
      >
        <slot name="additional-button" />
        <v-btn
          v-if="!noCloseButton"
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

export enum VeoAlertType {
  ERROR,
  INFO,
  SUCCESS
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
      type: Number as Prop<VeoAlertType>,
      default: VeoAlertType.ERROR
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
          return 'info';
        case 2:
          return 'success';
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
        default:
          return 'mdi-alert-circle-outline';
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

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
  <v-dialog
    v-model="dialog"
    max-width="80%"
    :persistent="persistent"
    :eager="eager"
    :width="width"
    :content-class="contentClass"
    class="veo-dialog"
  >
    <v-card
      :class="cardClass"
      tile
    >
      <div :style="fixedHeader ? 'position: sticky; top: 0; z-index: 1;' : ''">
        <v-card-title
          :class="{
            'pl-4 pr-0 py-0': !large && !xLarge,
            'pt-2 pb-1': large || xLarge
          }"
        >
          <span>{{ headline }}</span>
          <v-spacer />
          <v-btn
            v-if="!closeHidden"
            :disabled="closeDisabled"
            icon
            large
            class="close-button"
            @click="closeDialog()"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider class="mx-4" />
      </div>
      <v-card-text
        :class="[innerClass, 'pa-4', 'flex-grow-1']"
        style="position: relative;"
      >
        <slot />
      </v-card-text>
      <v-card-actions
        v-if="!!$slots['dialog-options']"
        class="pb-3 px-4 d-block pt-0"
        :style="fixedFooter ? 'position: sticky; bottom: -1px; z-index: 1;' : ''"
      >
        <v-divider v-if="fixedFooter" />
        <div class="d-flex pt-3">
          <slot name="dialog-options" />
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'VeoDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    headline: {
      type: String,
      required: true
    },
    large: {
      type: Boolean,
      default: false
    },
    xLarge: {
      type: Boolean,
      default: false
    },
    persistent: {
      type: Boolean,
      default: false
    },
    closeDisabled: {
      type: Boolean,
      default: false
    },
    closeHidden: {
      type: Boolean,
      default: false
    },
    closeFunction: {
      type: Function,
      default: () => () => {
        return true;
      }
    },
    fixedHeader: {
      type: Boolean,
      default: false
    },
    fixedFooter: {
      type: Boolean,
      default: false
    },
    eager: {
      type: Boolean,
      default: false
    },
    innerClass: {
      type: String,
      default: ''
    },
    contentClass: {
      type: String,
      default: ''
    },
    cardClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    dialog: {
      get(): boolean {
        return this.value;
      },
      set(newValue: boolean) {
        this.$emit('input', newValue);
      }
    },
    width(): string {
      if (this.large) return '900px';
      if (this.xLarge) return '1350px';
      return '450px';
    }
  },
  methods: {
    closeDialog() {
      if (this.closeFunction()) {
        this.$emit('input', false);
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.v-card,
.v-card__actions,
.v-card__title {
  background: $background-primary;
}
</style>
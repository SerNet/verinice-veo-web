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
    :width="large ? '900px' : '450px'"
  >
    <v-card>
      <v-card-title
        class="headline"
        :class="large ? '' : 'pl-4 pr-0 py-0'"
        :style="fixedHeader ? 'position: sticky; top: 0; z-index: 1;' : ''"
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
      <v-card-text
        class="pa-4"
        style="position: relative;"
      >
        <slot />
      </v-card-text>
      <v-card-actions
        v-if="hasActions"
        class="pb-3 px-4"
        :style="fixedFooter ? 'position: sticky; bottom: 0; z-index: 1;' : ''"
      >
        <slot name="dialog-options" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
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
    hasActions(): boolean {
      return (this.$slots['dialog-options']?.length || 0) > 0;
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
@import '~/assets/vuetify.scss';

.v-card__actions {
  background: white;
}

.headline {
  background: white;
  border-bottom: 1px solid $grey;
}
</style>

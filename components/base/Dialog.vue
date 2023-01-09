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
    :value="value"
    max-width="80%"
    :fullscreen="fullscreen"
    :width="width"
    :content-class="dialogClasses"
    v-bind="$attrs"
  >
    <v-card
      class="d-flex flex-column"
      :color="xLarge ? 'white' : undefined"
      tile
    >
      <div class="veo-dialog__inner--border-bottom">
        <v-card-title class="pt-2 pb-1">
          <LayoutAppLogoMobile
            v-if="fullscreen"
            style="height: 36px"
          />
          <span>{{ headline }}</span>
          <v-spacer />
          <v-btn
            :disabled="closeDisabled"
            icon
            large
            class="close-button"
            @click="closeDialog()"
          >
            <!--<v-icon :icon="`mdiSvg:${mdiClose}`" />-->
          </v-btn>
        </v-card-title>
      </div>
      <v-card-text
        class="pa-4 overflow-x-hidden overflow-y-auto flex-grow-1"
        style="position: relative;"
      >
        <div :class="innerClass">
          <slot />
        </div>
        <v-card-actions
          v-if="!!$slots['dialog-options'] && !fixedFooter"
          class="pt-3 pb-0 px-0"
        >
          <slot name="dialog-options" />
        </v-card-actions>
      </v-card-text>
      <v-card-actions
        v-if="!!$slots['dialog-options'] && fixedFooter"
        class="veo-dialog__actions--border-top"
        :class="{ 'pb-3 px-4 d-block pt-0': true }"
      >
        <div class="d-flex pt-3">
          <slot name="dialog-options" />
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { mdiClose } from '@mdi/js';

export default defineComponent({
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
    closeDisabled: {
      type: Boolean,
      default: false
    },
    closeFunction: {
      type: Function,
      default: () => () => {
        return true;
      }
    },
    fixedFooter: {
      type: Boolean,
      default: false
    },
    innerClass: {
      type: String,
      default: ''
    }
  },
  emits: ['input'],
  setup(props, { emit }) {
    // @ts-ignore $vuetify exists
    const { $vuetify } = useContext();

    const fullscreen = computed(() => (props.xLarge && $vuetify.breakpoint.mdAndDown) || (props.large && $vuetify.breakpoint.smAndDown) || $vuetify.breakpoint.xsOnly);

    const width = computed(() => {
      if (props.large) return '900px';
      if (props.xLarge) return '1350px';
      return '450px';
    });

    const closeDialog = () => {
      // @ts-ignore For some reason closeFunction has a value of never, but no Prop type seems to fit a function
      if (props.closeFunction()) {
        emit('input', false);
      }
    };

    const dialogClasses = computed(() => {
      const classes = {
        'overflow-hidden': true,
        'd-flex': props.value
      };

      return Object.entries(classes)
        .filter(([_, value]) => !!value)
        .map(([key, _]) => key)
        .join(' ');
    });

    return {
      closeDialog,
      dialogClasses,
      fullscreen,
      width,

      mdiClose
    };
  }
});
</script>

<style lang="scss" scoped>
.v-card,
.v-card__title {
  background-color: $background-accent;
}

.v-card__text {
  background-color: $background-primary;
}

.veo-dialog__inner--border-bottom {
  border-bottom: 1px solid $medium-grey;
}

.veo-dialog__actions--border-top {
  border-top: 1px solid $medium-grey;
}
</style>

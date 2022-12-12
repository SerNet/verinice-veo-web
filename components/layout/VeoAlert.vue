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
    v-bind="$attrs"
    :color="alertColor"
    colored-border
    border="left"
    :elevation="flat ? undefined : 2"
    dense
    class="veo-alert veo-border overflow-hidden"
    :class="{ 'veo-pseudo-hover': dismissOnClick }"
    :icon="alertIcon"
    style="border-radius: 12px"
    @click="onContentClick"
  >
    <v-row
      no-gutters
      class="justify-lg-space-between"
    >
      <v-col
        cols="auto"
        class="accent--text d-flex justify-center flex-column"
      >
        <h3
          class="text-h3"
          v-text="title"
        />
        <slot />
        <p
          v-if="text"
          class="mb-0 accent--text text-body-1"
          v-text="text"
        />
      </v-col>
      <v-col cols="auto">
        <slot name="additional-button" />
        <v-btn
          v-if="!noCloseButton"
          text
          :color="alertColor"
          @click="$emit('input', false)"
        >
          <span v-if="saveButtonText">{{ saveButtonText }}</span>
          <span v-else>{{ t('global.button.ok') }}</span>
        </v-btn>
      </v-col>
    </v-row>
    <v-progress-linear
      v-if="timeout"
      class="veo-alert-timeout-bar"
      absolute
      bottom
      :color="alertColor"
      height="4"
      :value="remainingTime / timeout * 100"
    />
  </v-alert>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, PropType, ref, watch } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';

import { VeoAlertType } from '~/types/VeoTypes';

export default defineComponent({
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
      type: Number as PropType<VeoAlertType>,
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
    },
    dismissOnClick: {
      type: Boolean,
      default: false
    },
    timeout: {
      type: Number,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const alertColor = computed(() => {
      switch (props.type) {
        case 0:
          return 'primary';
        case 1:
          return 'info';
        case 2:
          return 'success';
        default:
          return 'primary';
      }
    });

    const alertIcon = computed(() => {
      switch (props.type) {
        case 0:
          return 'mdi-alert-circle-outline';
        case 1:
          return 'mdi-information-outline';
        case 2:
          return 'mdi-check-circle-outline';
        default:
          return 'mdi-alert-circle-outline';
      }
    });

    let interval: any;
    const intervalTime = 50;
    const remainingTime = ref<number>(0);

    const onValueUpdated = (newValue: boolean) => {
      if (interval) {
        clearInterval(interval);
      }
      if (newValue && props.timeout) {
        remainingTime.value = props.timeout;
        interval = setInterval(() => {
          if (remainingTime.value <= 0) {
            emit('input', false);
          }

          remainingTime.value -= intervalTime;
        }, intervalTime);
      }
    };

    watch(() => props.value, onValueUpdated, { immediate: true });

    onUnmounted(() => {
      if (interval) {
        clearInterval(interval);
      }
    });

    const onContentClick = () => {
      if (props.dismissOnClick) {
        emit('input', false);
      }
    };

    return {
      alertColor,
      alertIcon,
      onContentClick,
      remainingTime,

      t
    };
  }
});
</script>

<style lang="scss" scoped>
.veo-alert ::v-deep i {
  align-self: center;
}

.veo-alert ::v-deep.v-alert__content {
  overflow: hidden;
  overflow-wrap: break-word;
}

.veo-alert-timeout-bar {
  left: 0;
}
</style>

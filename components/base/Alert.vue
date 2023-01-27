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
    :model-value="modelValue"
    v-bind="$attrs"
    :color="alertColor"
    border="start"
    :elevation="flat ? undefined : 2"
    class="veo-alert veo-border overflow-hidden"
    :class="{ 'veo-pseudo-hover': dismissOnClick, 'cursor-pointer': dismissOnClick }"
    :icon="alertIcon"
    variant="outlined"
    style="border-radius: 12px"
    @click="onContentClick"
  >
    <v-row
      no-gutters
      class="justify-lg-space-between"
    >
      <v-col
        cols="auto"
        class="d-flex justify-center flex-column"
      >
        <h3
          class="text-h3"
          v-text="title"
        />
        <slot />
        <p
          v-if="text"
          class="mb-0 text-body-1"
          v-text="text"
        />
        <p
          v-if="dismissOnClick"
          class="caption mt-2"
        >
          {{ t('clickToDismiss') }}
        </p>
      </v-col>
      <v-col cols="auto">
        <slot name="additional-button" />
        <v-btn
          v-if="!noCloseButton"
          variant="text"
          :color="alertColor"
          @click="$emit('update:model-value', false)"
        >
          <span v-if="saveButtonText">{{ saveButtonText }}</span>
          <span v-else>{{ globalT('global.button.ok') }}</span>
        </v-btn>
      </v-col>
    </v-row>
    <v-progress-linear
      v-if="timeout"
      class="veo-alert-timeout-bar"
      :color="alertColor"
      height="4"
      :model-value="remainingTime / timeout * 100"
    />
  </v-alert>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { mdiAlertCircleOutline, mdiCheckCircleOutline, mdiInformationOutline } from '@mdi/js';

import { VeoAlertType } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    modelValue: {
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
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });

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
          return mdiAlertCircleOutline;
        case 1:
          return mdiInformationOutline;
        case 2:
          return mdiCheckCircleOutline;
        default:
          return mdiAlertCircleOutline;
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
            emit('update:model-value', false);
          }

          remainingTime.value -= intervalTime;
        }, intervalTime);
      }
    };

    watch(() => props.modelValue, onValueUpdated, { immediate: true });

    onUnmounted(() => {
      if (interval) {
        clearInterval(interval);
      }
    });

    const onContentClick = () => {
      if (props.dismissOnClick) {
        emit('update:model-value', false);
      }
    };

    return {
      alertColor,
      alertIcon,
      onContentClick,
      remainingTime,

      t,
      globalT
    };
  }
});
</script>

<i18n>
{
  "en": {
    "clickToDismiss": "Click to dismiss"
  },
  "de": {
    "clickToDismiss": "Zum Schließen klicken"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-alert {
  background-color: white;
}

.veo-alert :deep(i) {
  align-self: center;
}

.veo-alert :deep(.v-alert__content) {
  overflow: hidden;
  overflow-wrap: break-word;
}

.veo-alert-timeout-bar {
  left: 0;
}
</style>

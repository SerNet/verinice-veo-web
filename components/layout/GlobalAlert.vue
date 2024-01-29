<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann
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
  <BaseAlert
    :model-value="value"
    v-bind="$props"
    :default-button-text="
      (params && params.defaultButtonText) || globalT('global.button.ok')
    "
    :buttons="buttons"
    enable-keyboard-navigation
    class="veo-global-alert"
    :no-close-button="type === VeoAlertType.SUCCESS"
    :dismiss-on-click="type === VeoAlertType.SUCCESS"
    :timeout="params ? params.timeout : undefined"
    @update:model-value="onInput"
  >
    <template #secondary-buttons>
      <div v-if="showDownloadDetailsButton && params && params.details">
        <v-btn variant="text" @click="downloadDetails">
          {{ t('downloadDetails') }}
        </v-btn>
        <a ref="downloadButton" href="#" />
      </div>
    </template>
  </BaseAlert>
</template>

<script lang="ts">
import { PropType } from 'vue';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { VeoAlertType, IVeoGlobalAlertParams } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    type: {
      type: Number as PropType<VeoAlertType>,
      required: true,
    },
    title: {
      type: String,
      default: undefined,
    },
    text: {
      type: String,
      default: '',
    },
    params: {
      type: Object as PropType<IVeoGlobalAlertParams>,
      default: undefined,
    },
    alertKey: {
      type: Number,
      default: undefined,
    },
  },
  setup(props) {
    const config = useRuntimeConfig();
    const { t } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    const { expireAlert } = useVeoAlerts();

    function onInput(newValue: boolean) {
      if (!newValue) {
        value.value = false;
        nextTick(() => {
          if (props.alertKey) {
            expireAlert(props.alertKey);
          }
        });
      }
    }

    // Create buttons for alert
    const buttons = computed(() =>
      unref(props.params?.actions || []).map((action) => ({
        text: action.text,
        onClick: () => {
          action.onClick();
          if (props.alertKey) {
            expireAlert(props.alertKey);
          }
        },
      }))
    );

    // If the alert key changes, we want to display a new alert from the alert queue, so redisplay the v-alert
    const value = ref(false);
    watch(
      () => props.alertKey,
      () => {
        value.value = true;
      },
      {
        immediate: true,
      }
    );

    const showDownloadDetailsButton = computed(() => config.public.debug);
    const downloadButton = ref();

    const downloadDetails = () => {
      const blob = new Blob([JSON.stringify(props.params?.details)], {
        type: 'text/json',
      });

      downloadButton.value.download = `error_${new Date().toISOString()}.json`;
      downloadButton.value.href = window.URL.createObjectURL(blob);
      downloadButton.value.dataset.downloadurl = [
        'text/json',
        downloadButton.value.download,
        downloadButton.value.href,
      ].join(':');

      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });

      downloadButton.value.dispatchEvent(evt);
    };

    return {
      buttons,
      downloadButton,
      downloadDetails,
      showDownloadDetailsButton,

      VeoAlertType,
      onInput,
      value,

      t,
      globalT,
    };
  },
});
</script>

<i18n>
{
  "en": {
    "downloadDetails": "Download details"
  },
  "de": {
    "downloadDetails": "Details herunterladen"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-global-alert {
  bottom: 24px;
  right: 16px;
  max-width: 400px;
  position: fixed;
  width: 100%;
  z-index: 2401;
}
</style>

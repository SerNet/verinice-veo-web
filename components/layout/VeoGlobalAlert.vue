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
  <VeoAlert
    v-model="value"
    v-bind="$props"
    :save-button-text="(params && params.buttonText) || t('global.button.ok')"
    class="veo-global-alert"
    :no-close-button="type === VeoAlertType.SUCCESS"
    :timeout="params ? params.timeout : undefined"
    @input="onInput"
  >
    {{ showDownloadDetailsButton }}
    <template #additional-button>
      <v-btn
        v-if="params && params.objectModified"
        text
        color="primary"
        @click="onCustomButtonClick('refetch')"
      >
        {{ t('global.button.yes') }}
      </v-btn>
      <div v-if="showDownloadDetailsButton && params && params.details">
        <v-btn
          text
          color
          @click="downloadDetails"
        >
          {{ t('downloadDetails') }}
        </v-btn>
        <a
          ref="downloadButton"
          href="#"
        />
      </div>
    </template>
  </VeoAlert>
</template>

<script lang="ts">
import { computed, defineComponent, PropOptions, ref, useContext, watch } from '@nuxtjs/composition-api';
import { mdiCheckCircleOutline } from '@mdi/js';
import { useI18n } from 'nuxt-i18n-composable';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { VeoAlertType, IVeoGlobalAlert, IVeoGlobalAlertParams } from '~/types/VeoTypes';

export default defineComponent<IVeoGlobalAlert>({
  props: {
    type: {
      type: Number,
      required: true
    } as PropOptions<VeoAlertType>,
    title: {
      type: String,
      default: undefined
    },
    text: {
      type: String,
      required: true
    },
    params: {
      type: Object,
      default: undefined
    } as PropOptions<IVeoGlobalAlertParams>,
    alertKey: {
      type: Number,
      default: undefined
    }
  },
  setup(props) {
    const { $config } = useContext();
    const { t } = useI18n();
    const { expireAlert, dispatchEventForCurrentAlert } = useVeoAlerts();

    function onInput(newValue: boolean) {
      if (!newValue && props.alertKey) {
        expireAlert(props.alertKey);
        value.value = false;
      }
    }

    // If the alert key changes, we want to display a new alert from the alert queue, so redisplay the v-snackbar/v-alert
    const value = ref(false);
    watch(
      () => props.alertKey,
      () => {
        value.value = true;
      },
      {
        immediate: true
      }
    );

    function onCustomButtonClick(event: string) {
      dispatchEventForCurrentAlert(event);
    }

    const showDownloadDetailsButton = computed(() => $config.debug);
    const downloadButton = ref();

    const downloadDetails = () => {
      const blob = new Blob([JSON.stringify(props.params?.details)], { type: 'text/json' });

      downloadButton.value.download = `error_${new Date().toISOString()}.json`;
      downloadButton.value.href = window.URL.createObjectURL(blob);
      downloadButton.value.dataset.downloadurl = ['text/json', downloadButton.value.download, downloadButton.value.href].join(':');

      const evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });

      downloadButton.value.dispatchEvent(evt);
    };

    return {
      downloadButton,
      downloadDetails,
      showDownloadDetailsButton,

      VeoAlertType,
      mdiCheckCircleOutline,
      onCustomButtonClick,
      onInput,
      value,

      t
    };
  }
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
  z-index: 301;
}
</style>
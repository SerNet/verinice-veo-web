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
  <v-snackbar
    v-if="type === alertType.SUCCESS"
    v-model="value"
    bottom
    light
    @input="onInput"
  >
    <v-row
      class="align-center"
      dense
    >
      <v-col cols="auto">
        <v-icon
          color="success"
          large
        >
          {{ mdiCheckCircleOutline }}
        </v-icon>
      </v-col>
      <v-col cols="auto">
        {{ text }}
      </v-col>
    </v-row>
  </v-snackbar>
  <VeoAlert
    v-else
    v-model="value"
    v-bind="$props"
    :save-button-text="(params && params.buttonText) || t('global.button.ok')"
    class="veo-global-alert"
    @input="onInput"
  >
    <template
      v-if="params && params.objectModified"
      #additional-button
    >
      <v-btn
        text
        color="primary"
        @click="onCustomButtonClick('refetch')"
      >
        {{ $t('global.button.yes') }}
      </v-btn>
    </template>
  </VeoAlert>
</template>

<script lang="ts">
import { defineComponent, PropOptions, ref, watch } from '@nuxtjs/composition-api';
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
    const { t } = useI18n();
    const { expireAlert, dispatchEventForCurrentAlert } = useVeoAlerts();

    function onInput(newValue: boolean) {
      if (!newValue && props.alertKey) {
        expireAlert(props.alertKey);
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

    return {
      alertType: VeoAlertType,
      mdiCheckCircleOutline,
      onCustomButtonClick,
      onInput,
      value,

      t
    };
  }
});
</script>

<style lang="scss" scoped>
.veo-global-alert {
  bottom: 0;
  left: 50%;
  max-width: 800px;
  position: fixed;
  transform: translateX(-50%);
  width: 100%;
  z-index: 301;
}
</style>
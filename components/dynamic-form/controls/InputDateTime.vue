<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <div v-if="options.visible" :id="objectSchemaPointer" class="vf-input-date-time vf-form-element d-flex">
    <!-- TODO-Vuetify: As of 3.1.0, v-date-picker and v-time-picker are not yet supported, so we use the browser fallback
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      transition="scale-transition"
      top
      max-width="350px"
      min-width="350px"
    >
      <template #activator="{ props }">
        <v-text-field
          v-bind="props"
          :id="objectSchemaPointer"
          :model-value="formattedDateTime"
          :disabled="disabled || options.disabled"
          :error-messages="getControlErrorMessages($props)"
          :label="options && options.label"
          :class="options && options.class"
          :clearable="!options.required"
          :prepend-icon="mdiCalendar"
          :hint="t('hint', [DATE_HINT])"
          readonly
          variant="plain"
          @click:clear="$emit('update:model-value', undefined)"
        />
      </template>
      <template #default>
        <v-card>
          <BaseTabs
            v-model="activeTab"
            grow
          >
            <template #tabs>
              <v-tab>
                <v-icon :icon="mdiCalendar" />
              </v-tab>
              <v-tab
                :disabled="!date"
              >
                <v-icon :icon="mdiClockOutline" />
              </v-tab>
            </template>
            <template #items>
              <v-window-item>
                <v-date-picker
                  :model-value="date"
                  color="primary"
                  no-title
                  full-width
                  @update:model-value="onDateInput"
                />
              </v-window-item>
              <v-window-item>
                <v-time-picker
                  :model-value="time"
                  color="primary"
                  format="24hr"
                  full-width
                  @update:model-value="onTimeInput"
                />
              </v-window-item>
            </template>
          </BaseTabs>
          <v-card-actions>
            <v-spacer />
            <v-btn
              text
              @click="menu = false"
            >
              {{ t('global.button.close') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-menu>-->
    <v-text-field
      type="date"
      :model-value="date"
      :disabled="disabled || options.disabled"
      :error-messages="getControlErrorMessages($props)"
      :label="options && options.label"
      :class="options && options.class"
      :clearable="!options.required"
      :data-attribute-name="last(objectSchemaPointer.split('/'))"
      :prepend-icon="mdiCalendar"
      :hint="t('hint', [DATE_HINT])"
      variant="underlined"
      @update:model-value="onDateInput"
      @click:clear="$emit('update:model-value', undefined)"
    />
    <v-text-field
      type="time"
      :model-value="time"
      :disabled="disabled || options.disabled"
      :error-messages="getControlErrorMessages($props)"
      :label="options && options.label"
      :class="options && options.class"
      :clearable="!options.required"
      :prepend-icon="mdiClockOutline"
      :hint="t('hint', [DATE_HINT])"
      variant="underlined"
      step="60"
      @update:model-value="onTimeInput"
      @click:clear="$emit('update:model-value', undefined)"
    />
  </div>
</template>

<script lang="ts">
import { last } from 'lodash';
import { mdiCalendar, mdiClockOutline } from '@mdi/js';
import { formatISO } from 'date-fns';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';
import { useFormatters } from '~/composables/utils';
import { dateIsValid } from '~/lib/utils';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-date-time-input',
  name: {
    en: 'date time input',
    de: 'Datums- und Zeiteingabe'
  },
  description: {
    en: 'Lets the user choose a date and time from a calender-like component.',
    de: 'Lässt den User mithilfe einer kalendermäßigen Komponente ein Datum und die dazugehörige Uhrzeit auswählen.'
  },
  conditions: (props) => [props.objectSchema.type === 'string', props.objectSchema.format === 'date-time']
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['update:model-value'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { formatDateTime } = useFormatters();

    const DATE_HINT = ref(formatDateTime(new Date()).value);

    // Display stuff
    const activeTab = ref(0);
    const menu = ref(false);

    watch(
      () => menu.value,
      (newValue, oldValue) => {
        if (newValue && !oldValue) {
          activeTab.value = 0;
        }
      }
    );

    const parseDateOrReturnUndefined = (date: any) => {
      try {
        const _date = new Date(date);
        if (dateIsValid(_date)) {
          return _date;
        }
        return undefined;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
        return undefined;
      }
    };

    const internalDateObject = computed(() => {
      if (props.modelValue) {
        return parseDateOrReturnUndefined(props.modelValue);
      }
      return undefined;
    });

    const formattedDateTime = computed(() => {
      if (internalDateObject.value) {
        return formatDateTime(internalDateObject.value).value;
      }
      return props.modelValue;
    });

    // Input related stuff
    const date = computed(() => {
      if (internalDateObject.value) {
        return formatISO(internalDateObject.value, { representation: 'date' });
      }
      return undefined;
    });
    const time = computed(() => {
      if (internalDateObject.value) {
        return formatISO(internalDateObject.value, {
          representation: 'time'
        }).split('+')[0];
      }
      return undefined;
    });

    const onDateInput = (newValue: string) => {
      let dateObject;
      if (!newValue) {
        emit('update:model-value', undefined);
        return;
      }
      if (internalDateObject.value) {
        dateObject = new Date(internalDateObject.value);
      } else {
        dateObject = new Date();
      }
      const splittedDateString = newValue.split('-');
      const year = parseInt(splittedDateString[0] || '', 10);
      const month = parseInt(splittedDateString[1] || '', 10);
      const date = parseInt(splittedDateString[2] || '', 10);
      if (year && month && date) {
        dateObject.setFullYear(year, month - 1, date);
        emit('update:model-value', formatISO(dateObject));
      } else {
        emit('update:model-value', newValue);
      }
      activeTab.value = 1;
    };

    const onTimeInput = (newValue: string) => {
      let dateObject;
      if (!newValue) {
        emit('update:model-value', undefined);
        return;
      }
      if (internalDateObject.value) {
        dateObject = new Date(internalDateObject.value);
      } else {
        dateObject = new Date();
      }
      const splittedTimeString = newValue.split(':');
      const hours = parseInt(splittedTimeString[0] || '', 10);
      const minutes = parseInt(splittedTimeString[1] || '', 10);
      if (hours !== undefined && minutes !== undefined) {
        dateObject.setHours(hours, minutes);
        emit('update:model-value', formatISO(dateObject));
      } else {
        emit('update:model-value', newValue);
      }
    };

    return {
      activeTab,
      date,
      formattedDateTime,
      menu,
      onDateInput,
      onTimeInput,
      time,

      getControlErrorMessages,
      last,
      mdiCalendar,
      mdiClockOutline,
      t,
      DATE_HINT
    };
  }
});
</script>

<i18n src="~/locales/base/components/dynamic-form-controls-InputDateTime.json"></i18n>

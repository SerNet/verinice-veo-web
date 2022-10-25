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
  <div
    v-if="options.visible"
    class="vf-input-date-time vf-form-element"
  >
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      transition="scale-transition"
      top
      max-width="350px"
      min-width="350px"
    >
      <template #activator="{ on }">
        <v-text-field
          :id="objectSchemaPointer"
          :value="formattedDateTime"
          :disabled="disabled || options.disabled"
          :error-messages="getControlErrorMessages($props)"
          :label="options && options.label"
          :class="options && options.class"
          :clearable="!options.required"
          hide-details="auto"
          :prepend-icon="mdiCalendar"
          :hint="t('hint', [DATE_HINT])"
          readonly
          v-on="on"
          @click:clear="$emit('input', undefined)"
        />
      </template>
      <template #default>
        <v-card>
          <VeoTabs
            v-model="activeTab"
            grow
          >
            <template #tabs>
              <v-tab>
                <v-icon>{{ mdiCalendar }}</v-icon>
              </v-tab>
              <v-tab
                :disabled="!date"
              >
                <v-icon>{{ mdiClockOutline }}</v-icon>
              </v-tab>
            </template>
            <template #items>
              <v-tab-item>
                <v-date-picker
                  :value="date"
                  color="primary"
                  no-title
                  full-width
                  @input="onDateInput"
                />
              </v-tab-item>
              <v-tab-item>
                <v-time-picker
                  :value="time"
                  color="primary"
                  format="24hr"
                  full-width
                  @input="onTimeInput"
                />
              </v-tab-item>
            </template>
          </VeoTabs>
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
    </v-menu>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from '@nuxtjs/composition-api';
import { mdiCalendar, mdiClockOutline } from '@mdi/js';
import { formatISO } from 'date-fns';
import { useI18n } from 'nuxt-i18n-composable';

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
      if (props.value) {
        return parseDateOrReturnUndefined(props.value);
      }
      return undefined;
    });

    const formattedDateTime = computed(() => {
      if (internalDateObject.value) {
        return formatDateTime(internalDateObject.value).value;
      }
      return props.value;
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
        return formatISO(internalDateObject.value, { representation: 'time' }).split('+')[0];
      }
      return undefined;
    });

    const onDateInput = (newValue: string) => {
      let dateObject;
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
        emit('input', formatISO(dateObject));
      } else {
        emit('input', newValue);
      }
      activeTab.value = 1;
    };

    const onTimeInput = (newValue: string) => {
      let dateObject;
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
        emit('input', formatISO(dateObject));
      } else {
        emit('input', newValue);
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
      mdiCalendar,
      mdiClockOutline,
      t,
      DATE_HINT
    };
  }
});
</script>

<i18n>
{
  "en": {
    "hint": "DD.MM.YYYY HH:MM e.g. {0}"
  },
  "de": {
    "hint": "TT.MM.JJJJ SS:MM z.B. {0}"
  }
}
</i18n>

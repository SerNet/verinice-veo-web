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
    class="vf-input-date vf-form-element"
  >
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
          :id="objectSchemaPointer"
          :value="formattedDate"
          :disabled="disabled || options.disabled"
          :error-messages="getControlErrorMessages($props)"
          :label="options && options.label"
          :class="options && options.class"
          :clearable="!options.required"
          hide-details="auto"
          :prepend-icon="`mdiSvg:${mdiCalendar}`"
          :hint="t('hint', [DATE_HINT])"
          readonly
          v-bind="props"
          @click:clear="$emit('input', undefined)"
        />
      </template>
      <template #default>
        <v-sheet
          color="white"
          class="d-flex justify-center"
        >
          <v-date-picker
            :value="value"
            color="primary"
            no-title
            @input="onDateInput"
          />
        </v-sheet>
      </template>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { mdiCalendar } from '@mdi/js';
import { formatISO } from 'date-fns';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';
import { useFormatters } from '~/composables/utils';
import { dateIsValid } from '~/lib/utils';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  code: 'veo-date-input',
  name: {
    en: 'date input',
    de: 'Datumseingabe'
  },
  description: {
    en: 'Lets the user choose a date from a calender-like component.',
    de: 'Lässt den User mithilfe einer kalendermäßigen Komponente ein Datum auswählen.'
  },
  conditions: (props) => [props.objectSchema.type === 'string', props.objectSchema.format === 'date']
};

export default defineComponent({
  name: CONTROL_DEFINITION.code,
  props: VeoFormsControlProps,
  emits: ['input'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { formatDate } = useFormatters();

    const DATE_HINT = ref(formatDate(new Date()).value);

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

    const formattedDate = computed(() => {
      if (internalDateObject.value) {
        return formatDate(internalDateObject.value).value;
      }
      return props.value;
    });

    const menu = ref(false);

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
        emit('input', formatISO(dateObject, { representation: 'date' }));
      } else {
        emit('input', newValue);
      }
      menu.value = false;
    };

    return {
      formattedDate,
      menu,
      onDateInput,

      getControlErrorMessages,
      mdiCalendar,
      t,
      DATE_HINT
    };
  }
});
</script>

<i18n>
{
  "en": {
    "hint": "DD.MM.YYYY e.g. {0}"
  },
  "de": {
    "hint": "DD.MM.YYYY z.B. {0}"
  }
}
</i18n>

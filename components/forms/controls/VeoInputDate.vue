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
      offset-y
      max-width="350px"
      min-width="350px"
    >
      <template #activator="{ on }">
        <v-text-field
          :id="objectSchemaPointer"
          :value="formattedDate"
          :disabled="disabled || options.disabled"
          :error-messages="getControlErrorMessages($props)"
          :label="options && options.label"
          :class="options && options.class"
          :clearable="!options.required"
          hide-details="auto"
          :prepend-icon="mdiCalendar"
          hint="DD.MM.YYYY"
          v-on="on"
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
import { computed, defineComponent, ref } from '@nuxtjs/composition-api';
import { mdiCalendar } from '@mdi/js';
import { formatISO } from 'date-fns';
import { useI18n } from 'nuxt-i18n-composable';

import { IVeoFormsElementDefinition } from '../types';
import { getControlErrorMessages, VeoFormsControlProps } from '../util';

export const CONTROL_DEFINITION: IVeoFormsElementDefinition = {
  key: 'veo-date-input',
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
  name: CONTROL_DEFINITION.key,
  props: VeoFormsControlProps,
  setup(props, { emit }) {
    const { locale } = useI18n();

    const formattedDate = computed({
      get() {
        return props.value ? new Date(props.value).toLocaleDateString(locale.value, { day: '2-digit', month: '2-digit', year: 'numeric' }) : undefined;
      },
      set(newValue: string | undefined) {
        emit('input', newValue ? formatISO(new Date(newValue), { representation: 'date' }) : undefined);
      }
    });

    const menu = ref(false);

    const onDateInput = (newValue: string) => {
      formattedDate.value = newValue;
      menu.value = false;
    };

    return {
      formattedDate,
      menu,
      onDateInput,

      getControlErrorMessages,
      mdiCalendar
    };
  }
});
</script>

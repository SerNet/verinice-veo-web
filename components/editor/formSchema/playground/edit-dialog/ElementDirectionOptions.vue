<!--
   - verinice.veo web
   - Copyright (C) 2023  Jonas Heitmann
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
  <v-select
    v-model="direction"
    :items="directionOptions"
    data-component-name="form-element-direction"
    :label="t('direction')"
    variant="underlined"
    :prepend-inner-icon="mdiSwapVertical"
  />
</template>

<script setup lang="ts">
import { mdiSwapVertical } from '@mdi/js';
import { cloneDeep } from 'lodash';
import { PropType } from 'vue';

import { IVeoFormSchemaItem } from '~~/types/VeoTypes';

const props = defineProps({
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  }
});

const emit = defineEmits<{
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void
}>();

const { t } = useI18n();

const directionOptions = ref([
  {
    title: t('vertical'),
    value: 'vertical'
  },
  {
    title: t('horizontal'),
    value: 'horizontal'
  }
]);

const direction = computed({
  get: () => props.formSchemaElement.options.direction || 'vertical',
  set: (newValue) => {
    const currentData = cloneDeep(props.formSchemaElement);
    if(!currentData.options) {
      currentData.options = {};
    }
    currentData.options.direction = newValue;
    emit('update:form-schema-element', currentData);
  }
});
</script>

<i18n>
{
  "en": {
    "direction": "Direction",
    "horizontal": "Horizontal",
    "vertical": "Vertical"
  },
  "de": {
    "direction": "Ausrichtung",
    "horizontal": "Horizontal",
    "vertical": "Vertikal"
  }
}
</i18n>

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
  <v-autocomplete
    v-model="activeOptions"
    data-component-name="form-element-styling-options"
    multiple
    :items="formattedOptions"
    :prepend-inner-icon="mdiPaletteOutline"
    variant="underlined"
    :label="t('stylingOptions')"
    clearable
  />
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { cloneDeep } from 'lodash';
import { mdiPaletteOutline } from '@mdi/js';

import { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';

const props = defineProps({
  formSchemaElement: {
    type: Object as PropType<IVeoFormSchemaItem>,
    required: true
  }
});

const emit = defineEmits<{
  (event: 'update:form-schema-element', formSchemaElement: IVeoFormSchemaItem): void;
}>();

const { t } = useI18n();

const options = ['border', 'bg-warning', 'bg-info', 'bg-error', 'text-warning', 'text-info', 'text-error'];

const formattedOptions = computed(() => options.map((option) => ({ value: option, title: t(`options.${option}`) })));

const activeOptions = computed({
  get: () => props.formSchemaElement.options?.class?.split(' ') || [],
  set: (newValue) => {
    const currentData = cloneDeep(props.formSchemaElement);
    if (!currentData.options) {
      currentData.options = {};
    }
    currentData.options.class = newValue.join(' ');
    emit('update:form-schema-element', currentData);
  }
});
</script>

<i18n src="~/locales/base/components/editor-form-schema-playground-edit-dialog-element-styling-options.json"></i18n>

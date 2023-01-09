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
  <v-row
    no-gutters
    v-bind="$attrs"
  >
    <v-col
      cols="auto"
      class="d-flex align-center"
    >
      <v-btn
        class="mr-2"
        color="white"
        rounded
        primary
        depressed
        small
        style="outline: 1px solid black"
        @click="filterDialogVisible = true"
      >
        <!--<v-icon :icon="`mdiSvg:${mdiFilter}`" />-->
        {{ upperFirst(t('filter').toString()) }}
      </v-btn>
    </v-col>
    <v-col
      cols="auto"
      class="grow"
    >
      <v-chip-group>
        <VeoObjectChip
          v-for="k in activeFilterKeys"
          :key="k"
          :label="formatLabel(k)"
          :value="formatValue(k, filter[k])"
          :close="!requiredFields.includes(k) && !disabledFields.includes(k)"
          @click:close="clearFilter(k)"
        />
      </v-chip-group>
    </v-col>
    <VeoObjectFilterDialog
      v-model="filterDialogVisible"
      v-bind="$props"
      @update:filter="$emit('update:filter', $event)"
    />
  </v-row>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { omit, upperFirst } from 'lodash';
import { mdiFilter } from '@mdi/js';

import { IVeoFormSchemaMeta } from '~/types/VeoTypes';
import { useFetchTranslations } from '~/composables/api/translations';
import { useFetchForms } from '~/composables/api/forms';

export default defineComponent({
  props: {
    filter: {
      type: Object as PropType<Record<string, any>>,
      required: true
    },
    domainId: {
      type: String,
      required: true
    },
    disabledFields: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    requiredFields: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    // Props only required by the filter dialog. We define them explicitly here as $attrs gets binded to the container, so we use $props for binding to the filter. Also better readability
    availableObjectTypes: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    availableSubTypes: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  emits: ['update:filter'],
  setup(props, { emit }) {
    const { t, locale } = useI18n();

    const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useFetchTranslations(fetchTranslationsQueryParameters);

    const formsQueryParameters = computed(() => ({ domainId: props.domainId }));
    const formsQueryEnabled = computed(() => !!props.domainId);
    const { data: formSchemas } = useFetchForms(formsQueryParameters, { enabled: formsQueryEnabled, placeholderData: [] });

    const filterDialogVisible = ref(false);

    // available & active filter options
    const filterKeys = ['objectType', 'subType', 'designator', 'name', 'status', 'description', 'updatedBy', 'notPartOfGroup', 'hasChildObjects'];
    const activeFilterKeys = computed(() => {
      return filterKeys.filter((k) => props.filter[k] !== undefined);
    });

    // formatting filter chips and their translations
    const formatLabel = (label: string) => {
      return upperFirst(t(`objectlist.${label}`).toString());
    };
    const formatValue = (label: string, value?: string) => {
      switch (label) {
        // Uppercase object types
        case 'objectType':
          return value ? translations.value?.lang[locale.value]?.[value] : undefined;
        // Translate sub types
        case 'subType':
          return (formSchemas.value as IVeoFormSchemaMeta[]).find((formSchema) => formSchema.subType === value)?.name?.[locale.value] || value;
        case 'status':
          return translations.value?.lang[locale.value]?.[`${props.filter.objectType}_${props.filter.subType}_status_${value}`] || value;
        default:
          return value;
      }
    };

    // remove one filter
    const clearFilter = (key: string) => {
      emit('update:filter', omit(props.filter, key));
    };

    return {
      activeFilterKeys,
      clearFilter,
      filterDialogVisible,
      formatLabel,
      formatValue,

      t,
      upperFirst,
      mdiFilter
    };
  }
});
</script>

<i18n>
{
  "en": {
    "filter": "filter"
  },
  "de": {
    "filter": "filter"
  }
}
</i18n>

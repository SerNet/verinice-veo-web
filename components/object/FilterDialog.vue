<!--
   - verinice.veo web
   - Copyright (C) 2021  Annemarie Bufe, Jonas Heitmann, Markus Werner, Samuel Vitzthum, Jessica Lühnen
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
  <BaseDialog
    v-model="dialog"
    v-bind="$attrs"
    :headline="upperFirst(t('filterList').toString())"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <v-form v-model="filterFormValid">
        <BaseCard>
          <v-card-text>
            <v-list>
              <ObjectFilter
                v-for="(option, index) of defaultFilterOptions"
                :key="option.name || `${option.type}_${index}`"
                :model-value="localFilter[option.name]"
                v-bind="option"
                @update:model-value="onFilterInput($event, option.name)"
              />
            </v-list>
          </v-card-text>
        </BaseCard>
        <BaseCard
          v-if="showAllFilters"
          class="mt-2"
        >
          <v-card-text>
            <v-list density="compact">
              <ObjectFilter
                v-for="(option, index) of additionalFilterOptions"
                :key="option.name || `${option.type}_${index}`"
                :model-value="localFilter[option.name]"
                v-bind="option"
                @update:model-value="onFilterInput($event, option.name)"
              />
            </v-list>
          </v-card-text>
        </BaseCard>
        <div class="d-flex justify-center fill-width my-2">
          <v-btn
            variant="text"
            @click="showAllFilters = !showAllFilters"
          >
            <template v-if="showAllFilters">
              <v-icon
                start
                :icon="mdiChevronUp"
              />
              <span>{{ upperFirst(t('collapseOptions').toString()) }}</span>
              <v-icon
                end
                :icon="mdiChevronUp"
              />
            </template>
            <template v-else>
              <v-icon
                start
                :icon="mdiChevronDown"
              />
              <span>{{ upperFirst(t('expandOptions').toString()) }}</span>
              <v-icon
                end
                :icon="mdiChevronDown"
              />
            </template>
          </v-btn>
        </div>
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn
        text
        @click="onReset"
      >
        {{ t(`resetFilter`) }}
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        text
        :disabled="filterFormValid === false"
        @click="onSubmit"
      >
        {{ t(`submitFilter`) }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { clone, omitBy, upperFirst } from 'lodash';

import { IVeoFilterDivider, IVeoFilterOption, IVeoFilterOptionType } from './Filter.vue';
import { extractSubTypesFromObjectSchema } from '~/lib/utils';
import { IVeoObjectSchema } from '~/types/VeoTypes';
import formQueryDefinitions, { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~~/composables/api/utils/query';
import { useFetchSchemasDetailed } from '~~/composables/api/schemas';

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    },
    domainId: {
      type: String,
      required: true
    },
    availableObjectTypes: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    availableSubTypes: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    disabledFields: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    requiredFields: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  emits: ['update:model-value', 'update:filter'],
  setup(props, { emit }) {
    const { t, locale } = useI18n();

    const queryParameters = computed(() => ({ domainIds: [props.domainId] }));
    const _schemas = useFetchSchemasDetailed(queryParameters);
    const schemas = ref<IVeoObjectSchema[]>([]);

    // _schemas is a non-reactive array, so we have to explicitly watch it to assign it to a ref so that the rest of vues reactivity picks up changes
    watch(
      () => _schemas,
      (newValue) => {
        schemas.value = newValue.map((query) => query.data).filter((schema) => schema) as IVeoObjectSchema[];
      },
      { deep: true, immediate: true }
    );

    const objectTypes = computed<string[]>(() => schemas.value.map((schema) => schema.title));
    const subTypes = computed<{ [schemaName: string]: { subType: string; name: Record<string, any>; status: string[] }[] }>(() =>
      schemas.value.reduce((previousValue, currentValue) => {
        previousValue[currentValue.title] = extractSubTypesFromObjectSchema(currentValue).map((subType) => ({
          ...subType,
          name: (formSchemas.value as IVeoFormSchemaMeta[]).find((fs) => fs.subType === subType.subType)?.name || {}
        }));
        return previousValue;
      }, Object.create(null))
    );

    // Fetching of object types & translations for status

    const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, fetchTranslationsQueryParameters);

    const formsQueryParameters = computed(() => ({ domainId: props.domainId as string}));
    const formsQueryEnabled = computed(() => !!props.domainId);
    const { data: formSchemas } = useQuery(formQueryDefinitions.queries.fetchForms, formsQueryParameters, { enabled: formsQueryEnabled, placeholderData: [] });

    // Form actions
    /**
     * Emits the currently applied filters and closes the dialog
     */
    function onSubmit() {
      // Remove false, null and undefined from object, as we only want filters that are applied in the object
      localFilter.value = omitBy(localFilter.value, (property) => !property);
      emit('update:filter', clone(localFilter.value));
      emit('update:model-value', false);
    }

    /**
     * Removes all set filters, emits them and closes the dialog
     */
    function onReset() {
      const newFilterObject: Record<string, any> = {};

      for (const key of Object.keys(localFilter.value)) {
        if (props.disabledFields.includes(key) || props.requiredFields.includes(key)) {
          newFilterObject[key] = localFilter.value[key];
        }
      }

      emit('update:filter', newFilterObject);
      emit('update:model-value', false);
    }

    // Filter stuff
    const filterFormValid = ref(false);

    // We keep a copy of the prop filter object as we only want to change the filters if the user clicks submit
    const localFilter = ref<Record<string, any>>(clone(props.filter) || {});
    watch(
      () => props.filter,
      (newValue) => {
        localFilter.value = clone(newValue) as Record<string, any>;
      }
    );

    const localAvailableSubTypes = computed(() => subTypes.value[localFilter.value.objectType] || []);

    const filterOptions = computed<(IVeoFilterOption | IVeoFilterDivider)[]>(() => {
      return [
        {
          name: 'objectType',
          type: IVeoFilterOptionType.SELECT,
          required: props.requiredFields.includes('objectType'),
          disabled: props.disabledFields?.includes('objectType'),
          alwaysVisible: true,
          selectOptions: props.availableObjectTypes.length
            ? objectTypes.value
              .filter((objectType) => props.availableObjectTypes.includes(objectType))
              .map((objectType) => ({ title: translations.value?.lang[locale.value]?.[objectType] || '', value: objectType }))
            : objectTypes.value.map((objectType) => ({ title: translations.value?.lang[locale.value]?.[objectType] || '', value: objectType })),
          onChange: () => {
            nextTick(() => {
              delete localFilter.value.subType;
              delete localFilter.value.status;
            });
          }
        },
        {
          name: 'subType',
          type: IVeoFilterOptionType.SELECT,
          alwaysVisible: true,
          disabled: !localFilter.value.objectType || props.disabledFields?.includes('subType'),
          selectOptions: localAvailableSubTypes.value
            .map((subTypes) => ({ title: subTypes.name[locale.value], value: subTypes.subType }))
            .filter((subTypes) => !props.availableSubTypes.length || props.availableSubTypes.includes(subTypes.value))
            .sort((a, b) => {
              const sortValueA = (formSchemas.value as IVeoFormSchemaMeta[]).find((schema) => schema.subType === a.value)?.sorting;
              const sortValueB = (formSchemas.value as IVeoFormSchemaMeta[]).find((schema) => schema.subType === b.value)?.sorting;

              if (!sortValueA) {
                return 1;
              }
              if (!sortValueB) {
                return 0;
              }

              return sortValueA.localeCompare(sortValueB);
            }),
          onChange: () => {
            delete localFilter.value.status;
          }
        },
        {
          type: IVeoFilterOptionType.DIVIDER
        } as IVeoFilterDivider,
        {
          name: 'designator',
          disabled: props.disabledFields?.includes('designator'),
          type: IVeoFilterOptionType.TEXT,
          alwaysVisible: true
        },
        {
          name: 'name',
          disabled: props.disabledFields?.includes('name'),
          type: IVeoFilterOptionType.TEXT,
          alwaysVisible: true
        },
        {
          name: 'status',
          type: IVeoFilterOptionType.SELECT,
          alwaysVisible: true,
          disabled: !localFilter.value.objectType || !localFilter.value.subType || props.disabledFields?.includes('status'),
          selectOptions: localAvailableSubTypes.value
            .find((subType) => subType.subType === localFilter.value.subType)
            ?.status.map((status) => ({
              title: translations.value ? translations.value.lang[locale.value][`${localFilter.value.objectType}_${localFilter.value.subType}_status_${status}`] : status,
              value: status
            }))
        },
        {
          name: 'description',
          disabled: props.disabledFields?.includes('description'),
          type: IVeoFilterOptionType.TEXT
        },
        {
          name: 'updatedBy',
          disabled: props.disabledFields?.includes('updatedBy'),
          type: IVeoFilterOptionType.TEXT
        },
        {
          name: 'notPartOfGroup',
          disabled: props.disabledFields?.includes('notPartOfGroup'),
          type: IVeoFilterOptionType.CHECKBOX
        },
        {
          name: 'hasChildObjects',
          disabled: props.disabledFields?.includes('hasChildObjects'),
          type: IVeoFilterOptionType.CHECKBOX
        }
      ];
    });

    // Display stuff
    const dialog = computed({
      get() {
        return props.modelValue;
      },
      set(value: boolean) {
        emit('update:model-value', value);

        // If the dialog gets closed, restore pristine state, 150ms seems to be the animation duration of v-dialog
        if (!value) {
          setTimeout(() => {
            localFilter.value = clone(props.filter) as Record<string, any>;
          }, 150);
        }
      }
    });
    const showAllFilters = ref(false);
    const defaultFilterOptions = computed(() => filterOptions.value.filter((filter) => filter.type === IVeoFilterOptionType.DIVIDER || filter.alwaysVisible));

    const additionalFilterOptions = computed(() => filterOptions.value.filter((filter) => filter.type !== IVeoFilterOptionType.DIVIDER && !filter.alwaysVisible));

    const onFilterInput = ($event: any, filter: string) => (localFilter.value = { ...localFilter.value, [filter]: $event });

    return {
      additionalFilterOptions,
      dialog,
      defaultFilterOptions,
      filterFormValid,
      localFilter,
      onFilterInput,
      onReset,
      onSubmit,
      showAllFilters,
      IVeoFilterOptionType,

      t,
      upperFirst,
      mdiChevronDown,
      mdiChevronUp
    };
  }
});
</script>

<i18n>
{
  "en": {
    "collapseOptions": "less options",
    "expandOptions": "more options",
    "filterList": "filter list",
    "resetFilter": "reset filter",
    "submitFilter": "apply filter"
  },
  "de": {
    "collapseOptions": "weniger Optionen",
    "expandOptions": "weitere Optionen",
    "filterList": "Liste filtern",
    "resetFilter": "Filter zurücksetzen",
    "submitFilter": "Filter anwenden"
  }
}
</i18n>

<style lang="scss" scoped>
.v-list {
  background: $background-accent;
}
</style>

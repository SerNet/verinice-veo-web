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
  <VeoDialog
    v-model="dialog"
    v-bind="$attrs"
    :headline="upperFirst(t('filterList').toString())"
  >
    <template #default>
      <v-form v-model="filterFormValid">
        <VeoCard>
          <v-card-text>
            <v-list dense>
              <VeoObjectFilter
                v-for="(option, index) of defaultFilterOptions"
                :key="option.name || `${option.type}_${index}`"
                :data-cy="option.type !== IVeoFilterOptionType.DIVIDER ? $utils.prefixCyData($options, 'filter-option') : ''"
                :value="localFilter[option.name]"
                v-bind="option"
                dense
                @input="onFilterInput($event, option.name)"
              />
            </v-list>
          </v-card-text>
        </VeoCard>
        <VeoCard
          v-if="showAllFilters"
          class="mt-2"
        >
          <v-card-text>
            <v-list dense>
              <VeoObjectFilter
                v-for="(option, index) of additionalFilterOptions"
                :key="option.name || `${option.type}_${index}`"
                :data-cy="option.type !== IVeoFilterOptionType.DIVIDER ? $utils.prefixCyData($options, 'filter-option') : ''"
                :value="localFilter[option.name]"
                v-bind="option"
                dense
                @input="onFilterInput($event, option.name)"
              />
            </v-list>
          </v-card-text>
        </VeoCard>
        <div class="d-flex justify-center fill-width my-2">
          <v-btn
            text
            :data-cy="$utils.prefixCyData($options, 'expand-button')"
            @click="showAllFilters = !showAllFilters"
          >
            <template v-if="showAllFilters">
              <v-icon left>
                {{ mdiChevronUp }}
              </v-icon>
              <span>{{ upperFirst(t('collapseOptions').toString()) }}</span>
              <v-icon right>
                {{ mdiChevronUp }}
              </v-icon>
            </template>
            <template v-else>
              <v-icon left>
                {{ mdiChevronDown }}
              </v-icon>
              <span>{{ upperFirst(t('expandOptions').toString()) }}</span>
              <v-icon right>
                {{ mdiChevronDown }}
              </v-icon>
            </template>
          </v-btn>
        </div>
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn
        text
        :data-cy="$utils.prefixCyData($options, 'reset-button')"
        @click="onReset"
      >
        {{ t(`resetFilter`) }}
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        :data-cy="$utils.prefixCyData($options, 'submit-button')"
        text
        :disabled="!filterFormValid"
        @click="onSubmit"
      >
        {{ t(`submitFilter`) }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { defineComponent, ref, computed, Ref, watch, ComputedRef, nextTick, PropType } from '@nuxtjs/composition-api';
import { clone, omitBy, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { IVeoFilterDivider, IVeoFilterOption, IVeoFilterOptionType } from './VeoObjectFilter.vue';
import { IBaseObject, extractSubTypesFromObjectSchema } from '~/lib/utils';
import { IVeoFormSchemaMeta, IVeoObjectSchema } from '~/types/VeoTypes';
import { useFetchForms } from '~/composables/api/forms';
import { useFetchTranslations } from '~/composables/api/translations';
import { useFetchSchemasDetailed } from '~/composables/api/schemas';

export default defineComponent({
  name: 'VeoObjectFilterDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Object as PropType<IBaseObject>,
      default: () => {}
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
    const subTypes = computed<{ [schemaName: string]: { subType: string; name: IBaseObject; status: string[] }[] }>(() =>
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
    const { data: translations } = useFetchTranslations(fetchTranslationsQueryParameters);

    const formsQueryParameters = computed(() => ({ domainId: props.domainId }));
    const formsQueryEnabled = computed(() => !!props.domainId);
    const { data: formSchemas } = useFetchForms(formsQueryParameters, { enabled: formsQueryEnabled, placeholderData: [] });

    // Form actions
    /**
     * Emits the currently applied filters and closes the dialog
     */
    function onSubmit() {
      // Remove false, null and undefined from object, as we only want filters that are applied in the object
      localFilter.value = omitBy(localFilter.value, (property) => !property);
      emit('update:filter', clone(localFilter.value));
      emit('input', false);
    }

    /**
     * Removes all set filters, emits them and closes the dialog
     */
    function onReset() {
      const newFilterObject: IBaseObject = {};

      for (const key of Object.keys(localFilter.value)) {
        if (props.disabledFields.includes(key) || props.requiredFields.includes(key)) {
          newFilterObject[key] = localFilter.value[key];
        }
      }

      emit('update:filter', newFilterObject);
      emit('input', false);
    }

    // Filter stuff
    const filterFormValid = ref(false);

    // We keep a copy of the prop filter object as we only want to change the filters if the user clicks submit
    const localFilter: Ref<IBaseObject> = ref(clone(props.filter) || {});
    watch(
      () => props.filter,
      (newValue) => {
        localFilter.value = clone(newValue) as IBaseObject;
      }
    );

    const localAvailableSubTypes = computed(() => subTypes.value[localFilter.value.objectType] || []);

    const filterOptions: ComputedRef<(IVeoFilterOption | IVeoFilterDivider)[]> = computed(() => {
      return [
        {
          name: 'objectType',
          type: IVeoFilterOptionType.SELECT,
          required: props.requiredFields.includes('objectType'),
          disabled: props.disabledFields?.includes('objectType'),
          alwaysVisible: true,
          selectOptions: props.availableObjectTypes.length
            ? objectTypes.value
                .filter((objectType) => props.availableObjectTypes!.includes(objectType))
                .map((objectType) => ({ text: translations.value?.lang[locale.value]?.[objectType] || '', value: objectType }))
            : objectTypes.value.map((objectType) => ({ text: translations.value?.lang[locale.value]?.[objectType] || '', value: objectType })),
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
            .map((subTypes) => ({ text: subTypes.name[locale.value], value: subTypes.subType }))
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
              text: translations.value ? translations.value.lang[locale.value][`${localFilter.value.objectType}_${localFilter.value.subType}_status_${status}`] : status,
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
        return props.value;
      },
      set(value: boolean) {
        emit('input', value);

        // If the dialog gets closed, restore pristine state, 150ms seems to be the animation duration of v-dialog
        if (!value) {
          setTimeout(() => {
            localFilter.value = clone(props.filter) as IBaseObject;
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
    "collapseOptions": "more options",
    "expandOptions": "less options",
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
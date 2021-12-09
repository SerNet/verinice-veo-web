<!--
   - verinice.veo web
   - Copyright (C) 2021  Annemarie Bufe
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
    :headline="t('filterList')"
  >
    <template #default>
      <v-form v-model="filterFormValid">
        <v-list dense>
          <v-list-item
            v-for="(option, index) of displayedFilterOptions"
            :key="option.name || `${option.type}_${index}`"
            dense
          >
            <v-divider v-if="option.type === IVeoFilterOptionType.DIVIDER" />
            <v-text-field
              v-else-if="option.type === IVeoFilterOptionType.TEXT"
              v-model="localFilter[option.name]"
              :label="upperFirst(t(`objectlist.${option.name}`).toString()) + (option.required ? '*' : '')"
              :required="option.required"
              :rules="option.required ? [requiredRule] : []"
              :disabled="option.disabled"
              clearable
              dense
              @input="(newValue) => option.onChange ? option.onChange(newValue) : () => {}"
            />
            <v-select
              v-else-if="option.type === IVeoFilterOptionType.SELECT"
              v-model="localFilter[option.name]"
              :label="upperFirst(t(`objectlist.${option.name}`).toString()) + (option.required ? '*' : '')"
              :required="option.required"
              :rules="option.required ? [requiredRule] : []"
              :items="option.selectOptions"
              :disabled="option.disabled"
              clearable
              dense
              @change="(newValue) => option.onChange ? option.onChange(newValue) : () => {}"
            />
            <v-checkbox
              v-else-if="option.type === IVeoFilterOptionType.CHECKBOX"
              v-model="localFilter[option.name]"
              :label="upperFirst(t(`objectlist.${option.name}`).toString()) + (option.required ? '*' : '')"
              :required="option.required"
              :rules="option.required ? [requiredRule] : []"
              :disabled="option.disabled"
              dense
              @change="(newValue) => option.onChange ? option.onChange(newValue) : () => {}"
            />
          </v-list-item>
          <v-list-item
            class="justify-center"
            @click="showAllFilters = !showAllFilters"
          >
            <template v-if="showAllFilters">
              <v-icon>{{ mdiChevronDoubleUp }}</v-icon>
              <span>{{ t('collapseOptions') }}</span>
              <v-icon>{{mdiChevronDoubleUp}}</v-icon>
            </template>
            <template v-else>
              <v-icon>{{ mdiChevronDoubleDown }}</v-icon>
              <span>{{ t('expandOptions') }}</span>
              <v-icon>{{ mdiChevronDoubleDown }}</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-form>
    </template>
    <template #dialog-options>
      <v-btn
        text
        class="reset-btn"
        @click="onReset"
      >
        {{$t(`resetFilter`)}}
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        class="submit-btn"
        text
        :disabled="!filterFormValid"
        @click="onSubmit"
      >
        {{$t(`submitFilter`)}}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { mdiChevronDoubleDown, mdiChevronDoubleUp } from '@mdi/js';
import { defineComponent, ref, computed, Ref, watch, PropOptions, ComputedRef, useFetch, useContext } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { BaseObject } from '../forms/utils';
import { IBaseObject } from '~/lib/utils';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoFormSchemaMeta, IVeoTranslations } from '~/types/VeoTypes';

enum IVeoFilterOptionType {
  TEXT,
  SELECT,
  CHECKBOX,
  DIVIDER
}

interface IVeoFilterOption {
  name: string;
  type: IVeoFilterOptionType;
  required?: boolean;
  alwaysVisible?: boolean;
  selectOptions?: { text: string; value: string }[];
  disabled?: boolean;
  onChange?: (value: string) => void;
}

interface IVeoFilterDivider {
  type: IVeoFilterOptionType.DIVIDER;
}

export default defineComponent({
  name: 'VeoFilterDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    objectTypeRequired: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Object,
      default: () => {}
    } as PropOptions<IBaseObject>,
    domain: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const { $api } = useContext();
    const { t, locale } = useI18n();

    // Fetching of object types & translations for status
    const objectTypes: Ref<IVeoSchemaEndpoint[]> = ref([]);
    const formschemas: Ref<IVeoFormSchemaMeta[]> = ref([]);
    const subTypes: Ref<{ [schemaName: string]: { subType: string; name: BaseObject; status: string[] }[] }> = ref({});
    const translations: Ref<IVeoTranslations | undefined> = ref(undefined);

    useFetch(async () => {
      // Only fetch object types once, as changes are highly unlikely (preemptively included, if fetch() gets called by a watcher in the future)
      if (objectTypes.value.length === 0) {
        objectTypes.value = await $api.schema.fetchAll();
        formschemas.value = await $api.form.fetchAll(props.domain);
        for await (const objectType of objectTypes.value) {
          await fetchSubTypesForSchema(objectType.schemaName);
        }
      }

      // Only fetch translations once, as changes are highly unlikely (preemptively included, if fetch() gets called by a watcher in the future)
      if (!translations.value) {
        translations.value = await $api.translation.fetch(['de', 'en']);
      }
    });

    // Create an object containing all subtypes for an object schema with all their status
    async function fetchSubTypesForSchema(schema: string) {
      const _schema = await $api.schema.fetch(schema);

      subTypes.value[schema] =
        // @ts-ignore TODO: Remove before merge
        Object.values(_schema.properties.domains.properties)[0].allOf?.map((mapping) => ({
          subType: mapping.if.properties.subType.const,
          status: mapping.then.properties.status.enum,
          name: formschemas.value.find((fs) => fs.subType === mapping.if.properties.subType.const)?.name || {}
        })) || [];
    }

    // Form actions
    /**
     * Emits the currently applied filters and closes the dialog
     */
    function onSubmit() {
      // Remove false, null and undefined from object, as we only want filters that are applied in the object
      for (const key of Object.keys(localFilter.value)) {
        if (!localFilter.value[key]) {
          delete localFilter.value[key];
        }
      }
      emit('update:filter', localFilter.value);
      emit('input', false);
    }

    /**
     * Emits the currently applied filters and closes the dialog
     */
    function onReset() {
      emit('filter', {});
      emit('input', false);
    }

    // Filter stuff
    const filterFormValid = ref(false);
    function requiredRule(value: string) {
      return !!value && value.length > 0;
    }

    // We keep a copy of the prop filter object as we only want to change the filters if the user clicks submit
    const localFilter: Ref<IBaseObject> = ref({});
    watch(
      () => props.filter,
      (newValue) => {
        localFilter.value = newValue as IBaseObject;
      }
    );

    const filterOptions: ComputedRef<(IVeoFilterOption | IVeoFilterDivider)[]> = computed(() => [
      {
        name: 'objectType',
        type: IVeoFilterOptionType.SELECT,
        required: props.objectTypeRequired,
        alwaysVisible: true,
        selectOptions: objectTypes.value.map((objectType) => ({ text: upperFirst(objectType.schemaName), value: objectType.schemaName })),
        onChange: () => {
          delete localFilter.value.subType;
          delete localFilter.value.status;
        }
      },
      {
        name: 'subType',
        type: IVeoFilterOptionType.SELECT,
        alwaysVisible: true,
        disabled: !localFilter.value.objectType,
        selectOptions: (subTypes.value[localFilter.value.objectType] || [])
          .map((subTypes) => ({ text: subTypes.name[locale.value], value: subTypes.subType }))
          .sort((a, b) => {
            const sortValueA = formschemas.value.find((schema) => schema.subType === a.value)?.sorting;
            const sortValueB = formschemas.value.find((schema) => schema.subType === b.value)?.sorting;

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
        type: IVeoFilterOptionType.TEXT,
        alwaysVisible: true
      },
      {
        name: 'name',
        type: IVeoFilterOptionType.TEXT,
        alwaysVisible: true
      },
      {
        name: 'status',
        type: IVeoFilterOptionType.SELECT,
        alwaysVisible: true,
        disabled: !localFilter.value.objectType || !localFilter.value.subType,
        selectOptions: (subTypes.value[localFilter.value.objectType] || [])
          .find((subType) => subType.subType === localFilter.value.subType)
          ?.status.map((status) => ({
            text: translations.value ? translations.value.lang[locale.value][`${localFilter.value.objectType}_${localFilter.value.subType}_status_${status}`] : status,
            value: status
          }))
      },
      {
        name: 'description',
        type: IVeoFilterOptionType.TEXT
      },
      {
        name: 'updatedBy',
        type: IVeoFilterOptionType.TEXT
      },
      {
        name: 'notPartOfGroup',
        type: IVeoFilterOptionType.CHECKBOX
      },
      {
        name: 'hasChildObjects',
        type: IVeoFilterOptionType.CHECKBOX
      },
      {
        name: 'hasLinks',
        type: IVeoFilterOptionType.CHECKBOX
      }
    ]);

    // Display stuff
    const dialog = computed({
      get() {
        return props.value;
      },
      set(value: boolean) {
        emit('input', value);
      }
    });
    const showAllFilters = ref(false);
    const displayedFilterOptions = computed(() =>
      showAllFilters.value ? filterOptions.value : filterOptions.value.filter((filter) => filter.type === IVeoFilterOptionType.DIVIDER || filter.alwaysVisible)
    );

    return {
      dialog,
      displayedFilterOptions,
      filterFormValid,
      localFilter,
      onReset,
      onSubmit,
      requiredRule,
      showAllFilters,

      t,
      upperFirst,
      mdiChevronDoubleDown,
      mdiChevronDoubleUp,
      IVeoFilterOptionType
    };
  }
});
</script>

<style lang="scss" scoped>

</style>

<i18n>
{
  "en": {
    "collapseOptions": "More options",
    "expandOptions": "Less options",
    "filterList": "Filter list",
    "resetFilter": "reset filter",
    "submitFilter": "apply filter"
  },
  "de": {
    "collapseOptions": "Weniger Optionen",
    "expandOptions": "Weitere Optionen",
    "filterList": "Liste filtern",
    "resetFilter": "filter zurücksetzen",
    "submitFilter": "filter anwenden"
  }
}
</i18n>
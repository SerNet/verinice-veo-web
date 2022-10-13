<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Jessica Lühnen
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
    :value="value"
    large
    :headline="t('headline', [linkedObjectType])"
    :persistent="savingObject"
    :close-disabled="savingObject"
    fixed-footer
    v-on="$listeners"
  >
    <template #default>
      <p v-if="!!$slots.header">
        <slot name="header" />
      </p>
      <p
        v-else-if="hierarchicalContext === 'child'"
        class="text-body-1"
      >
        {{ t('linkChildExplanation', { displayName: editedObjectDisplayName, linkedObjectType }) }}
      </p>
      <p
        v-else
        class="text-body-1"
      >
        {{ t('linkParentExplanation', { displayName: editedObjectDisplayName, linkedObjectType }) }}
      </p>
      <v-row no-gutters>
        <v-col
          cols="auto"
          class="d-flex align-center"
        >
          <v-btn
            v-cy-name="'filter-button'"
            class="mr-2"
            color="white"
            rounded
            primary
            depressed
            small
            style="outline: 1px solid black"
            @click="filterDialogVisible = true"
          >
            <v-icon>{{ mdiFilter }}</v-icon> {{ upperFirst(t('filter').toString()) }}
          </v-btn>
        </v-col>
        <v-col
          cols="auto"
          class="grow"
        >
          <v-chip-group v-cy-name="'chips'">
            <VeoObjectChip
              v-for="k in activeFilterKeys"
              :key="k"
              :label="formatLabel(k)"
              :value="formatValue(k, filter[k])"
              :close="k!='objectType'"
              @click:close="clearFilter(k)"
            />
          </v-chip-group>
        </v-col>
      </v-row>
      <VeoCard>
        <VeoObjectTable
          v-model="modifiedSelectedItems"
          show-select
          checkbox-color="primary"
          :default-headers="['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt', 'actions']"
          :items="objectList"
          :loading="fetchState.pending || isLoading"
          @page-change="onPageChange"
        />
      </VeoCard>
    </template>
    <template #dialog-options>
      <v-btn
        text
        :disabled="savingObject"
        @click="$emit('input', false)"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :data-cy="$utils.prefixCyData($options, 'save-button')"
        :loading="savingObject"
        @click="linkObjects"
      >
        {{ t('global.button.save') }}
      </v-btn>
      <VeoFilterDialog
        v-model="filterDialogVisible"
        :domain="domainId"
        :filter="filter"
        :allowed-object-types="allowedObjectTypes"
        object-type-required
        @update:filter="updateFilter"
      />
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { defineComponent, useRoute, ref, computed, useContext, useFetch, watch, PropType, reactive } from '@nuxtjs/composition-api';
import { cloneDeep, differenceBy, pick, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { mdiFilter } from '@mdi/js';
import { getEntityDetailsFromLink, IBaseObject, separateUUIDParam } from '~/lib/utils';
import { getSchemaName, IVeoSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoEntity, IVeoLink, IVeoTranslations } from '~/types/VeoTypes';
import { useVeoObjectUtilities } from '~/composables/VeoObjectUtilities';
import { useFetchObjects } from '~/composables/api/objects';
import { useFetchForms } from '~/composables/api/forms';

export default defineComponent({
  name: 'VeoLinkObjectDialog',
  props: {
    /**
     * Defines whether the dialog is visible or not
     */
    value: {
      type: Boolean,
      required: true
    },
    /**
     * Defines whether the current objects parent/child scopes should be edited or the parent/child objects of the same type as the object.
     */
    addType: {
      type: String as PropType<'scope' | 'entity'>,
      required: true
    },
    /**
     * Either pass a complete object (contains the id) or an object containing the minimal properties required for this component to work.
     * If you pass a complete object you don't have to define selectedItems, these will be automatically fetched and selected.
     */
    editedObject: {
      type: Object as PropType<IVeoEntity | { type: string; name: string }>,
      required: true
    },
    /**
     * Pass a list of objects that should be preselected. Usually only required if editedObject doesn't get passed.
     * If editedObject is set, those values will be merged with the values defined here.
     */
    selectedItems: {
      type: Array as PropType<({ type: string; id: string } | IVeoEntity)[]>,
      default: () => []
    },
    /**
     * Defines whether the selected objects should be added as children or as parents
     */
    hierarchicalContext: {
      type: String as PropType<'parent' | 'child'>,
      default: 'child'
    },
    /**
     * Instead of saving, returns the selected items
     */
    returnObjects: {
      type: Boolean,
      default: false
    },
    preselectedFilters: {
      type: Object,
      default: () => {}
    },
    /**
     * Return complete objects as selected items.
     * NOTE: If you use this prop, please make sure that you pass a complete object as editedObject and if you use
     * the prop selectedItems that the items are also of type IVeoEntity
     */
    useFullObjects: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const route = useRoute();
    const { t, locale } = useI18n();
    const { $api, $user } = useContext();
    const { linkObject, unlinkObject } = useVeoObjectUtilities();

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    const objectSchemas = ref<IVeoSchemaEndpoint[]>([]);
    const translations = ref<IVeoTranslations['lang']>({});

    const formsQueryParameters = computed(() => ({ domainId: domainId.value }));
    const formsQueryEnabled = computed(() => !!domainId.value);
    const { data: formSchemas } = useFetchForms(formsQueryParameters, { enabled: formsQueryEnabled });

    const { fetchState } = useFetch(async () => {
      const [_schemas, _translations] = await Promise.all([$api.schema.fetchAll(), $api.translation.fetch(['de', 'en'])]);
      objectSchemas.value = _schemas;
      translations.value = _translations.lang;
    });

    const editedObjectDisplayName = computed(() => ((props.editedObject as IVeoEntity).id ? (props.editedObject as IVeoEntity).displayName : props.editedObject.name));

    /**
     * Common stuff
     */
    const linkedObjectType = computed(() => {
      return props.addType === 'scope' ? ['Scope'] : props.editedObject.type === 'scope' ? t('object').toString() : upperFirst(props.editedObject.type);
    });

    // Table/filter logic
    const filter = ref<IBaseObject>({});
    const filterDialogVisible = ref(false);

    const objectsQueryParameters = reactive({ page: 1, sortBy: 'name', sortDesc: false });
    const resetQueryOptions = () => {
      Object.assign(objectsQueryParameters, { page: 1, sortBy: 'name', sortDesc: false });
    };

    const combinedObjectsQueryParameters = computed(() => ({
      size: $user.tablePageSize,
      sortBy: objectsQueryParameters.sortBy,
      sortOrder: objectsQueryParameters.sortDesc ? 'desc' : 'asc',
      page: objectsQueryParameters.page,
      unit: separateUUIDParam(route.value.params.unit).id,
      ...filter.value
    }));
    const objectsQueryEnabled = computed(() => !!filter.value.objectType);

    const { data: objectList, isLoading } = useFetchObjects(combinedObjectsQueryParameters as any, { enabled: objectsQueryEnabled, keepPreviousData: true });

    watch(
      () => props.preselectedFilters,
      (newValue) => {
        filter.value = { ...filter.value, ...newValue };
      },
      {
        deep: true,
        immediate: true
      }
    );

    // available & active filter options
    const filterKeys = ['objectType', 'subType', 'designator', 'name', 'status', 'description', 'updatedBy', 'notPartOfGroup', 'hasChildObjects'];
    const activeFilterKeys = computed(() => {
      return filterKeys.filter((k) => filter.value[k] !== undefined);
    });

    watch(() => filter.value, resetQueryOptions, { deep: true });

    // formatting filter chips and their translations
    const formatLabel = (label: string) => {
      return upperFirst(t(`objectlist.${label}`).toString());
    };
    const formatValue = (label: string, value?: string) => {
      switch (label) {
        // Uppercase object types
        case 'objectType':
          return t(`objectTypes.${value}`).toString();
        // Translate sub types
        case 'subType':
          return (formSchemas.value || []).find((formSchema) => formSchema.subType === value)?.name?.[locale.value] || value;
        case 'status':
          return translations.value[locale.value]?.[`${filter.value.objectType}_${filter.value.subType}_status_${value}`] || value;
        default:
          return value;
      }
    };

    // remove one filter
    const clearFilter = (key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: remove, ...rest } = filter.value;
      filter.value = { ...rest };
    };

    // update filter options
    const updateFilter = (newFilter: IBaseObject) => {
      filter.value = { ...newFilter };
    };

    // refetch entities on page or sort changes (in VeoObjectTable)
    const onPageChange = (opts: { newPage: number; sortBy: string; sortDesc?: boolean }) => {
      Object.assign(objectsQueryParameters, { page: opts.newPage, sortBy: opts.sortBy, sortDesc: !!opts.sortDesc });
    };

    // get allowed filter-objectTypes for current parent and child type
    const allowedObjectTypes = computed(() => {
      if (props.hierarchicalContext === 'parent') {
        if (props.addType === 'entity') {
          // Only allow the same schema for the parent as the one of the current element...
          return objectSchemas.value.filter((item) => item.schemaName === props.editedObject.type);
        } else {
          // ...or a scope
          return objectSchemas.value.filter((item) => item.endpoint === 'scopes');
        }
      } else {
        // Filter out scopes if the user wants to add objects and the parent is a scope
        if (props.editedObject.type === 'scope' && props.addType === 'entity') {
          return objectSchemas.value.filter((item) => item.endpoint !== 'scopes');
        }
        // Only scope if the user wants to add scopes and the parent is a scope
        if (props.editedObject.type === 'scope' && props.addType === 'scope') {
          return objectSchemas.value.filter((item) => item.endpoint === 'scopes');
        }
        // Only own object type if the user wants to add objects and the parent is a object
        if (props.editedObject.type !== 'scope' && props.addType === 'entity') {
          return objectSchemas.value.filter((item) => item.schemaName === props.editedObject.type);
        }
      }

      return [];
    });

    watch(
      () => allowedObjectTypes.value,
      (newValue) => {
        if (newValue?.[0]) {
          filter.value = { objectType: allowedObjectTypes.value[0].schemaName };
        }
      }
    );

    // Linking logic
    const mergedSelectedItems = ref<({ id: string; type: string } | IVeoEntity)[]>([]);
    const modifiedSelectedItems = ref<({ id: string; type: string } | IVeoEntity)[]>([]); // Doesn't get modified to compare which parents have been added removed

    const savingObject = ref(false); // saving status for adding entities
    const linkObjects = async () => {
      if (props.returnObjects || !(props.editedObject as IVeoEntity).designator) {
        if (!props.returnObjects) {
          // eslint-disable-next-line no-console
          console.warn('VeoLinkObjectDialog:: returnObjects is set to false, but no entity was passed. Continuing as if returnObjects is set to true');
        }
        emit('update:selected-items', modifiedSelectedItems.value);
        emit('input', false);
      } else {
        savingObject.value = true;
        const _editedObject = props.editedObject as IVeoEntity;

        try {
          if (props.hierarchicalContext === 'parent') {
            const parentsToAdd = differenceBy(modifiedSelectedItems.value, mergedSelectedItems.value, 'id');
            const parentsToRemove = differenceBy(mergedSelectedItems.value, modifiedSelectedItems.value, 'id');
            for (const parent of parentsToAdd) {
              await linkObject('parent', pick(_editedObject, 'id', 'type'), parent);
            }
            for (const parent of parentsToRemove) {
              await unlinkObject(parent.id, _editedObject.id, parent.type);
            }
          } else {
            await linkObject(
              props.hierarchicalContext,
              pick(_editedObject, 'id', 'type'),
              modifiedSelectedItems.value.map((selectedItem) => pick(selectedItem, 'id', 'type'))
            );
          }
          emit('success');
        } catch (error: any) {
          emit('error', error);
        } finally {
          savingObject.value = false;
        }
      }
    };

    const preselectItems = async () => {
      if (props.hierarchicalContext === 'child') {
        // If edited object is a complete object, fetch preselected items and merge them with the passed ones (usually those are empty)
        if ((props.editedObject as IVeoEntity).designator) {
          if (props.useFullObjects) {
            if (props.selectedItems && props.selectedItems.some((selectedItem) => !(selectedItem as IVeoEntity).designator)) {
              // eslint-disable-next-line no-console
              console.warn(
                'VeoLinkObjectDialog::preselectItems: It seems like you used the prop useFullObject while passing minimal objects in selectedItems. Please configure the component according to the description of the useFullObjects prop.'
              );
            }
            const children = await $api.entity.fetchSubEntities(filter.value.objectType, (props.editedObject as IVeoEntity).id);
            mergedSelectedItems.value = [...props.selectedItems, ...children];
          } else {
            const _editedObject = props.editedObject as IVeoEntity;
            const childrenProperty = props.editedObject.type === 'scope' ? 'members' : 'parts';
            mergedSelectedItems.value = [
              ...props.selectedItems,
              ..._editedObject[childrenProperty].map((child: IVeoLink) => {
                const details = getEntityDetailsFromLink(child);
                const id = details.id;
                let type = details.type;
                type = getSchemaName(objectSchemas.value, type) || type;

                return { id, type };
              })
            ];
          }
        } else {
          mergedSelectedItems.value = [...props.selectedItems];
        }
        // Parents with full objects
      } else if (props.useFullObjects) {
        if (props.selectedItems && props.selectedItems.some((selectedItem) => !(selectedItem as IVeoEntity).designator)) {
          // eslint-disable-next-line no-console
          console.warn(
            'VeoLinkObjectDialog::preselectItems: It seems like you used the prop useFullObject while passing minimal objects in selectedItems. Please configure the component according to the description of the useFullObjects prop.'
          );
        }

        const _editedObject = props.editedObject as IVeoEntity;
        const parentType = props.addType === 'entity' ? _editedObject.type : 'scope';
        const parents = (await $api.entity.fetchParents(parentType, _editedObject.id)).items;

        mergedSelectedItems.value = [...props.selectedItems, ...parents];
        // Parents with minimal objects (no pre-queried pre selected items), as full objects don't contain links to their parents
      } else {
        mergedSelectedItems.value = [...props.selectedItems];
      }
      modifiedSelectedItems.value = cloneDeep(mergedSelectedItems.value);
    };

    watch(
      () => props.editedObject,
      () => {
        resetQueryOptions();
        preselectItems();
      },
      { deep: true }
    );

    // Display logic
    watch(
      () => props.value,
      (newValue) => {
        if (newValue) {
          resetQueryOptions();
          preselectItems();
        }
      },
      {
        immediate: true
      }
    );

    return {
      activeFilterKeys,
      allowedObjectTypes,
      clearFilter,
      domainId,
      editedObjectDisplayName,
      fetchState,
      filter,
      filterDialogVisible,
      formatLabel,
      formatValue,
      isLoading,
      linkedObjectType,
      linkObjects,
      modifiedSelectedItems,
      objectList,
      onPageChange,
      savingObject,
      updateFilter,

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
    "filter": "filter",
    "headline": "select {0}",
    "linkChildExplanation": "Add {linkedObjectType} as a part to \"{parentName}\"",
    "linkParentExplanation": "Add {linkedObjectType} as a parent to \"{parentName}\"",
    "object": "object"
  },
  "de": {
    "filter": "filter",
    "headline": "{0} auswählen",
    "linkChildExplanation": "{linkedObjectType} unter \"{displayName}\" einfügen",
    "linkParentExplanation": "{linkedObjectType} über \"{displayName}\" einfügen",
    "object": "Objekt"
  }
}
</i18n>

<style lang="scss" scoped>
.v-data-table {
  background-color: transparent;
}
</style>

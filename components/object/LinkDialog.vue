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
  <BaseDialog
    :model-value="modelValue"
    v-bind="$attrs"
    large
    :headline="title"
    :persistent="savingObject"
    :close-disabled="savingObject"
    fixed-footer
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <p v-if="!!$slots.header">
        <slot name="header" />
      </p>
      <p
        v-else-if="!editParents"
        class="text-body-1"
      >
        {{ t('linkChildExplanation', { displayName: object && object.displayName, newObjectTypeName }) }}
      </p>
      <p
        v-else
        class="text-body-1"
      >
        {{ t('linkParentExplanation', { displayName: object && object.displayName, newObjectTypeName }) }}
      </p>
      <ObjectFilterBar
        :domain-id="domainId"
        :filter="filter"
        :available-object-types="availableObjectTypes"
        :required-fields="['objectType']"
        @update:filter="updateFilter"
      />
      <BaseCard>
        <ObjectTable
          v-model="modifiedSelectedItems"
          v-model:page="page"
          v-model:sort-by="sortBy"
          show-select
          :default-headers="['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt', 'actions']"
          :items="selectableObjects"
          :loading="objectsLoading || childrenLoading || parentsLoading"
        />
      </BaseCard>
    </template>
    <template #dialog-options>
      <v-btn
        text
        :disabled="savingObject"
        @click="$emit('update:model-value', false)"
      >
        {{ t('global.button.cancel') }}
      </v-btn>
      <v-spacer />
      <v-btn
        text
        color="primary"
        :loading="savingObject"
        :disabled="ability.cannot('manage', 'objects')"
        @click="linkObjects"
      >
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { differenceBy, omit, uniqBy, upperFirst } from 'lodash';

import { getEntityDetailsFromLink, separateUUIDParam } from '~/lib/utils';
import { IVeoEntity } from '~/types/VeoTypes';
import { useUnlinkObject, useLinkObject } from '~/composables/VeoObjectUtilities';
import { useFetchObjects, useFetchParentObjects } from '~/composables/api/objects';
import { useVeoUser } from '~/composables/VeoUser';
import objectQueryDefinitions, { IVeoFetchScopeChildrenParameters } from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery, useQuerySync } from '~~/composables/api/utils/query';

export default defineComponent({
  props: {
    /**
     * Defines whether the dialog is visible or not
     */
    modelValue: {
      type: Boolean,
      required: true
    },
    /**
     * Defines whether the current objects parent/child scopes should be edited or the parent/child objects of the same type as the object.
     */
    editScopeRelationship: {
      type: Boolean,
      default: false
    },
    /**
     * Defines whether the selected objects should be added as children or as parents
     */
    editParents: {
      type: Boolean,
      default: false
    },
    /**
     * Either pass a complete object (contains the id) or an object containing the minimal properties required for this component to work.
     * If you pass a complete object you don't have to define selectedItems, these will be automatically fetched and selected.
     */
    object: {
      type: Object as PropType<IVeoEntity | undefined>,
      required: true
    },
    /**
     * Pass a list of objects that should be preselected. Those values will be merged with the values defined in this component.
     */
    preselectedItems: {
      type: Array as PropType<IVeoEntity[]>,
      default: () => []
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
      default: () => ({})
    }
  },
  emits: ['update:preselected-items', 'update:model-value', 'success', 'error'],
  setup(props, { emit }) {
    const route = useRoute();
    const { t, locale } = useI18n();
    const { tablePageSize } = useVeoUser();
    const { link } = useLinkObject();
    const { unlink } = useUnlinkObject();
    const { ability } = useVeoPermissions();

    const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
    const translationsQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, translationsQueryParameters);

    const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);

    const newObjectTypeName = computed(() =>
      props.editScopeRelationship
        ? translations.value?.lang?.[locale.value]?.scope
        : props.object?.type === 'scope'
          ? t('object')
          : translations.value?.lang?.[locale.value][props.object?.type || '']
    );
    const title = computed(() =>
      t(
        props.editParents && props.editScopeRelationship
          ? 'editParentScopes'
          : props.editScopeRelationship
            ? 'editChildScopes'
            : props.editParents
              ? 'editParentObjects'
              : 'editChildObjects',
        [props.object?.displayName]
      )
    );

    // Table/filter logic
    const filter = ref<Record<string, any>>({});

    const page = ref(1);
    const sortBy = ref([{ key: 'name', order: 'desc' }]);
    const resetQueryOptions = () => {
      page.value = 1;
      sortBy.value = [{ key: 'name', order: 'desc' }];
    };

    const objectListEndpoint = computed(() => endpoints.value?.[filter.value.objectType] || '');
    const combinedObjectsQueryParameters = computed<any>(() => ({
      size: tablePageSize.value,
      sortBy: sortBy.value[0].key,
      sortOrder: sortBy.value[0].order,
      page: page.value,
      unit: separateUUIDParam(route.params.unit as string).id,
      ...omit(filter.value, 'objectType'),
      endpoint: objectListEndpoint.value
    }));
    const objectsQueryEnabled = computed(() => !!objectListEndpoint.value);
    const {
      data: objects,
      isFetching: objectsLoading
    } = useFetchObjects(combinedObjectsQueryParameters, { enabled: objectsQueryEnabled, keepPreviousData: true });

    // All objects that are selectable (this includes everyone but the object itself and marks already selected items as disabled)
    const currentChildrenIds = computed(() => [...(props.object?.members || []), ...(props.object?.parts || [])].map((link) => getEntityDetailsFromLink(link).id));
    const selectableObjects = computed(() => ({
      ...objects.value,
      items: (objects.value?.items || []).filter((object) => object.id !== props.object?.id).map((selectableObject) => ({
        ...selectableObject,
        disabled: currentChildrenIds.value.includes(selectableObject.id)
      }))
    }));

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

    watch(() => filter.value, resetQueryOptions, { deep: true });

    // update filter options
    const updateFilter = (newFilter: Record<string, any>) => {
      filter.value = { ...newFilter };
    };

    // get allowed filter-objectTypes for current parent and child type
    const availableObjectTypes = computed<string[]>(() => {
      const objectSchemaNames = Object.keys(endpoints.value || {});
      if (props.editScopeRelationship) {
        return objectSchemaNames.filter((item) => item === 'scope');
      } else if (props.object?.type === 'scope') {
        return objectSchemaNames.filter((item) => item !== 'scope');
      } else {
        return [props.object?.type || ''];
      }
    });

    watch(
      () => availableObjectTypes.value,
      (newValue) => {
        if (newValue?.[0]) {
          filter.value = { objectType: newValue[0] };
        }
      },
      { immediate: true, deep: true }
    );

    // Selectable and selected objects
    const objectEndpoint = computed(() => endpoints.value?.[props.object?.type || ''] || '');
    const parentsQueryParameters = computed(() => ({
      size: -1,
      page: 1,
      unitId: separateUUIDParam(route.params.unit as string).id,
      parentEndpoint: objectListEndpoint.value,
      childObjectId: props.object?.id || ''
    }));
    const parentsQueryEnabled = computed(() => !!objectEndpoint.value && !!props.object?.id && props.editParents);
    const { data: parents, isFetching: parentsLoading } = useFetchParentObjects(parentsQueryParameters, { enabled: parentsQueryEnabled, keepPreviousData: false });

    const childObjectsQueryParameters = computed(() => ({
      endpoint: objectEndpoint.value,
      id: props.object?.id || ''
    }));
    const childObjectsQueryEnabled = computed(() => !!objectEndpoint.value && !!props.object?.id && !props.editParents && objectEndpoint.value !== 'scopes');
    const { data: childObjects, isFetching: childObjectsLoading } = useQuery(objectQueryDefinitions.queries.fetchObjectChildren, childObjectsQueryParameters, { enabled: childObjectsQueryEnabled });

    const childScopesQueryParameters = computed<IVeoFetchScopeChildrenParameters>(() => ({
      id: props.object?.id || ''
    }));
    const childScopesQueryEnabled = computed(() => !!objectEndpoint.value && !!props.object?.id && !props.editParents && objectEndpoint.value === 'scopes');
    const { data: childScopes, isFetching: childScopesLoading } = useQuery(objectQueryDefinitions.queries.fetchScopeChildren, childScopesQueryParameters, { enabled: childScopesQueryEnabled });

    const children = computed(() => uniqBy([...(childObjects.value || []), ...(childScopes.value || []), ...props.preselectedItems], (arrayEntry) => arrayEntry.id));
    const childrenLoading = computed(() => childObjectsLoading.value || childScopesLoading.value);

    const originalSelectedItems = computed(() => (props.editParents ? parents.value?.items || [] : children.value)); // Doesn't get modified to compare which parents have been added removed
    const modifiedSelectedItems = ref<IVeoEntity[]>([]);
    watch(
      () => originalSelectedItems.value,
      (newValue) => {
        modifiedSelectedItems.value = newValue;
      },
      { deep: true, immediate: true }
    );

    // Linking logic
    const savingObject = ref(false); // saving status for adding entities
    const linkObjects = async () => {
      if(ability.value.cannot('manage', 'objects')) {
        return;
      }
      if (props.returnObjects) {
        emit('update:preselected-items', modifiedSelectedItems.value);
        emit('update:model-value', false);
      } else {
        savingObject.value = true;
        try {
          if (props.object && endpoints.value) {
            if (props.editParents) {
              const parentsToAdd = differenceBy(modifiedSelectedItems.value, originalSelectedItems.value, 'id');
              const parentsToRemove = differenceBy(originalSelectedItems.value, modifiedSelectedItems.value, 'id');
              for (const parent of parentsToAdd) {
                const _parent = await useQuerySync(objectQueryDefinitions.queries.fetch, { endpoint: endpoints.value?.[parent.type], id: parent.id });
                await link(_parent, props.object);
              }
              for (const parent of parentsToRemove) {
                const _parent = await useQuerySync(objectQueryDefinitions.queries.fetch, { endpoint: endpoints.value?.[parent.type], id: parent.id });
                await unlink(_parent, props.object.id);
              }
            } else {
              await link(props.object, modifiedSelectedItems.value, true);
            }
          }
          emit('success');
        } catch (error: any) {
          emit('error', error);
        } finally {
          savingObject.value = false;
        }
      }
    };

    watch(
      () => props.object,
      () => resetQueryOptions,
      { deep: true }
    );

    // Display logic
    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue) {
          resetQueryOptions();
        }
      },
      {
        immediate: true
      }
    );

    return {
      ability,
      availableObjectTypes,
      childrenLoading,
      domainId,
      filter,
      linkObjects,
      modifiedSelectedItems,
      newObjectTypeName,
      objectsLoading,
      page,
      parentsLoading,
      savingObject,
      selectableObjects,
      sortBy,
      title,
      updateFilter,

      t,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "editChildObjects": "Edit parts of \"{0}\"",
    "editChildScopes": "Edit scopes of \"{0}\"",
    "editParentObjects": "Edit parent parts of \"{0}\"",
    "editParentScopes": "Edit parent scopes of \"{0}\"",
    "linkChildExplanation": "Add {newObjectTypeName} as a part to \"{parentName}\"",
    "linkParentExplanation": "Add {newObjectTypeName} as a parent to \"{parentName}\"",
    "object": "object"
  },
  "de": {
    "editChildObjects": "Teile von \"{0}\" bearbeiten",
    "editChildScopes": "Scopes von \"{0}\" bearbeiten",
    "editParentObjects": "Teile über \"{0}\" bearbeiten",
    "editParentScopes": "Scopes über \"{0}\" bearbeiten",
    "linkChildExplanation": "{newObjectTypeName} unter \"{displayName}\" einfügen",
    "linkParentExplanation": "{newObjectTypeName} über \"{displayName}\" einfügen",
    "object": "Objekt"
  }
}
</i18n>

<style lang="scss" scoped>
.v-data-table {
  background-color: transparent;
}
</style>

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
    :headline="title"
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
      <VeoObjectFilterBar
        :domain-id="domainId"
        :filter="filter"
        :available-object-types="availableObjectTypes"
        :required-fields="['objectType']"
        @update:filter="updateFilter"
      />
      <VeoCard>
        <VeoObjectTable
          v-model="modifiedSelectedItems"
          show-select
          checkbox-color="primary"
          :default-headers="['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt', 'actions']"
          :items="selectableObjects"
          :loading="objectsLoading || childrenLoading || parentsLoading"
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
        :loading="savingObject"
        @click="linkObjects"
      >
        {{ t('global.button.save') }}
      </v-btn>
    </template>
  </VeoDialog>
</template>

<script lang="ts">
import { defineComponent, useRoute, ref, computed, watch, PropType, reactive, useContext } from '@nuxtjs/composition-api';
import { differenceBy, uniqBy, upperFirst } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';

import { IBaseObject, separateUUIDParam } from '~/lib/utils';
import { IVeoEntity } from '~/types/VeoTypes';
import { useUnlinkObject, useLinkObject } from '~/composables/VeoObjectUtilities';
import { useFetchChildObjects, useFetchChildScopes, useFetchObjects, useFetchParentObjects } from '~/composables/api/objects';
import { useVeoUser } from '~/composables/VeoUser';
import { useFetchSchemas } from '~/composables/api/schemas';
import { useFetchTranslations } from '~/composables/api/translations';

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
      default: () => {}
    }
  },
  setup(props, { emit }) {
    const route = useRoute();
    const { t, locale } = useI18n();
    const { tablePageSize } = useVeoUser();
    const { link } = useLinkObject();
    const { unlink } = useUnlinkObject();
    const { $api } = useContext();

    const { data: endpoints } = useFetchSchemas();
    const translationsQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useFetchTranslations(translationsQueryParameters);

    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

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
    const filter = ref<IBaseObject>({});

    const objectsQueryParameters = reactive({ page: 1, sortBy: 'name', sortDesc: false });
    const resetQueryOptions = () => {
      Object.assign(objectsQueryParameters, { page: 1, sortBy: 'name', sortDesc: false });
      refetchObjects(); // A dirty workaround, as vue-query doesn't pick up changes to the query key. Hopefully solved with nuxt 3
    };

    const objectListEndpoint = computed(() => endpoints.value?.[filter.value.objectType] || '');
    const combinedObjectsQueryParameters = computed(() => ({
      size: tablePageSize.value,
      sortBy: objectsQueryParameters.sortBy,
      sortOrder: (objectsQueryParameters.sortDesc ? 'desc' : 'asc') as 'asc' | 'desc',
      page: objectsQueryParameters.page,
      unit: separateUUIDParam(route.value.params.unit).id,
      ...filter.value,
      endpoint: objectListEndpoint.value
    }));
    const objectsQueryEnabled = computed(() => !!objectListEndpoint.value);
    const {
      data: objects,
      isFetching: objectsLoading,
      refetch: refetchObjects
    } = useFetchObjects(combinedObjectsQueryParameters, { enabled: objectsQueryEnabled, keepPreviousData: true });
    const selectableObjects = computed(() => (objects.value?.items || []).filter((object) => object.id !== props.object?.id));

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
    const updateFilter = (newFilter: IBaseObject) => {
      filter.value = { ...newFilter };
    };

    // refetch entities on page or sort changes (in VeoObjectTable)
    const onPageChange = (opts: { newPage: number; sortBy: string; sortDesc?: boolean }) => {
      Object.assign(objectsQueryParameters, { page: opts.newPage, sortBy: opts.sortBy, sortDesc: !!opts.sortDesc });
      refetchObjects(); // A dirty workaround, as vue-query doesn't pick up changes to the query key. Hopefully solved with nuxt 3
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
      unitId: separateUUIDParam(route.value.params.unit).id,
      parentEndpoint: objectListEndpoint.value,
      childObjectId: props.object?.id || ''
    }));
    const parentsQueryEnabled = computed(() => !!objectEndpoint.value && !!props.object?.id && props.editParents);
    const { data: parents, isFetching: parentsLoading } = useFetchParentObjects(parentsQueryParameters, { enabled: parentsQueryEnabled, keepPreviousData: true });

    const childObjectsQueryParameters = computed(() => ({
      endpoint: objectEndpoint.value,
      id: props.object?.id || ''
    }));
    const childObjectsQueryEnabled = computed(() => !!objectEndpoint.value && !!props.object?.id && !props.editParents && objectEndpoint.value !== 'scopes');
    const { data: childObjects, isFetching: childObjectsLoading } = useFetchChildObjects(childObjectsQueryParameters, { enabled: childObjectsQueryEnabled });

    const childScopesQueryParameters = computed(() => ({
      id: props.object?.id || ''
    }));
    const childScopesQueryEnabled = computed(() => !!objectEndpoint.value && !!props.object?.id && !props.editParents && objectEndpoint.value === 'scopes');
    const { data: childScopes, isFetching: childScopesLoading } = useFetchChildScopes(childScopesQueryParameters, { enabled: childScopesQueryEnabled });

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
      if (props.returnObjects) {
        emit('update:selected-items', modifiedSelectedItems.value);
        emit('input', false);
      } else {
        savingObject.value = true;
        try {
          if (props.object && endpoints.value) {
            if (props.editParents) {
              const parentsToAdd = differenceBy(modifiedSelectedItems.value, originalSelectedItems.value, 'id');
              const parentsToRemove = differenceBy(originalSelectedItems.value, modifiedSelectedItems.value, 'id');
              for (const parent of parentsToAdd) {
                const _parent = await $api.entity.fetch(endpoints.value?.[parent.type], parent.id);
                await link(_parent, props.object);
              }
              for (const parent of parentsToRemove) {
                const _parent = await $api.entity.fetch(endpoints.value?.[parent.type], parent.id);
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
      () => props.value,
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
      availableObjectTypes,
      childrenLoading,
      domainId,
      filter,
      linkObjects,
      modifiedSelectedItems,
      newObjectTypeName,
      objectsLoading,
      onPageChange,
      parentsLoading,
      savingObject,
      selectableObjects,
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

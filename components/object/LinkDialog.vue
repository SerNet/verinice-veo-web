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
    :title="title"
    :close-disabled="savingObject"
    :confirm-close="itemsSelected"
    fixed-footer
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #default>
      <p v-if="!!$slots.header">
        <slot name="header" />
      </p>

      <!-- @vue-ignore TODO #3066 $route does not exist -->
      <ObjectFilterBar
        :domain-id="$route.params.domain as string"
        :disabled-fields="disabledFields"
        :filter="filter"
        :available-object-types="availableObjectTypes"
        :required-fields="['objectType']"
        @update:filter="updateFilter"
      />

      <SearchBar v-model:search="search" />

      <BaseCard id="link-dialog-select-all">
        <ObjectTable
          v-model="modifiedSelectedItems"
          v-model:page="page"
          v-model:sort-by="sortBy"
          show-select
          :default-headers="[
            'icon',
            'designator',
            'abbreviation',
            'name',
            'status',
            'description',
            'updatedBy',
            'updatedAt',
            'actions'
          ]"
          :items="selectableObjects"
          :loading="objectsLoading || childrenLoading || parentsLoading || isLoadingSearchResults"
          :no-data-text="noDataTextWithLink"
        />
      </BaseCard>
    </template>

    <template #dialog-options>
      <v-btn variant="text" :disabled="savingObject" @click="$emit('update:model-value', false)">
        {{ globalT('global.button.cancel') }}
      </v-btn>

      <v-spacer />
      <v-btn
        variant="text"
        color="primary"
        :loading="savingObject"
        :disabled="ability.cannot('manage', 'objects') || !isDirty"
        @click="linkObjects"
      >
        {{ globalT('global.button.save') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { differenceBy, isEqual, omit, uniqBy, upperFirst } from 'lodash';
import { PropType } from 'vue';
import HtmlRenderer from '~/components/base/HtmlRenderer.vue';
import { useLinkObject, useUnlinkObject } from '~/composables/VeoObjectUtilities';
import { useVeoUser } from '~/composables/VeoUser';
import { useFetchObjects, useFetchParentObjects } from '~/composables/api/objects';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import { useQuery, useQuerySync } from '~/composables/api/utils/query';
import { useNavigation } from '~/composables/navigation';
import type { VeoSearch } from '~/types/VeoSearch';
import type { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

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
    editRelationship: {
      type: String,
      default: ''
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
    linkRiskAffected: {
      type: Boolean,
      default: false
    },
    preselectedFilters: {
      type: Object,
      default: () => ({})
    },
    disabledFields: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  emits: ['update:preselected-items', 'update:model-value', 'success', 'error'],
  setup(props, { emit }) {
    const route = useRoute();
    const { navigateToCatalog, navigateToObject } = useNavigation();
    const { t, locale } = useI18n();
    const { t: globalT } = useI18n({ useScope: 'global' });
    const { tablePageSize } = useVeoUser();
    const { link } = useLinkObject();
    const { unlink } = useUnlinkObject();
    const { ability } = useVeoPermissions();
    const queryClient = useQueryClient();
    const { createLink } = useCreateLink();
    const { mutateAsync: updateObject } = useMutation(objectQueryDefinitions.mutations.updateObject);
    const { data: translations } = useTranslations({ domain: route.params.domain as string });

    const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas);
    const title = computed(() => {
      const { object, editParents } = props;
      const displayName = [object?.displayName];

      if (object?.type === 'control' && object?.subType === 'CTL_Module') {
        return t('addTarget', [props.editRelationship]);
      }

      if (object?.type === 'control') {
        return t('addControls', displayName);
      }

      const editScopeRelationship = props.editRelationship === 'scope';

      if (editParents && editScopeRelationship) {
        return t('editParentScopes', displayName);
      }

      if (editScopeRelationship) {
        return t('editChildScopes', displayName);
      }

      if (editParents) {
        return t('editParentObjects', displayName);
      }

      return t('editChildObjects', displayName);
    });

    // Table/filter logic
    const filter = ref<Record<string, any>>({});

    const page = ref(1);
    const sortBy = ref([{ key: 'name', order: 'asc' }]);
    const resetQueryOptions = () => {
      page.value = 1;
      sortBy.value = [{ key: 'name', order: 'asc' }];
    };

    const objectListEndpoint = computed(() => endpoints.value?.[filter.value.objectType] || '');
    const combinedObjectsQueryParameters = computed<any>(() => ({
      size: tablePageSize.value,
      sortBy: sortBy.value[0]?.key,
      sortOrder: sortBy.value[0]?.order,
      page: page.value,
      unit: route.params.unit as string,
      domain: route.params.domain as string,
      ...omit(filter.value, 'objectType'),
      endpoint: objectListEndpoint.value
    }));
    const objectsQueryEnabled = computed(() => !!objectListEndpoint.value);
    const { data: _objects, isFetching: objectsLoading } = useFetchObjects(combinedObjectsQueryParameters, {
      enabled: objectsQueryEnabled,
      keepPreviousData: true
    });

    // SEARCH
    // v-model from `SearchBar`
    const hasItems = computed(() => _objects.value?.totalItemCount && _objects.value.totalItemCount > 0);
    const search = ref<VeoSearch[]>([]);

    // get search results
    const { data: searchResults, isLoading: isLoadingSearchResults } = useSearch({
      baseQueryParameters: combinedObjectsQueryParameters,
      search
    });

    // items rendered in ObjectTable
    const objects = computed<IVeoPaginatedResponse<IVeoEntity[]>>(() => {
      if (searchResults.value) {
        return searchResults.value;
      }
      return _objects.value;
    });

    const selectableObjects = computed(() => {
      return {
        ...objects.value,
        items: (objects.value?.items || []).map((selectableObject) => ({
          ...selectableObject,
          disabled:
            !!originalSelectedItems.value.find((item) => getIdFromItem(item) === selectableObject.id) ||
            props.object?.id === selectableObject.id
        }))
      };
    });

    const getIdFromItem = (item: IVeoEntity) => {
      return item.id;
    };

    watch(() => filter.value, resetQueryOptions, { deep: true });

    // update filter options
    const updateFilter = (newFilter: Record<string, any>) => {
      filter.value = { ...newFilter };
    };

    // get allowed filter-objectTypes for current parent and child type
    const availableObjectTypes = computed<string[]>(() => {
      const objectSchemaNames = Object.keys(endpoints.value || {});
      if (props.editRelationship) {
        return objectSchemaNames.filter((item) => item === props.editRelationship);
      } else if (props.object?.type === 'scope') {
        return objectSchemaNames.filter((item) => item !== 'scope');
      } else {
        return props.object?.type ? [props.object?.type] : [];
      }
    });

    watch(
      () => availableObjectTypes.value,
      (newValue) => {
        if (newValue?.[0]) {
          filter.value = { ...filter.value, objectType: newValue[0] };
        }
      },
      { immediate: true, deep: true }
    );

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

    // Selectable and selected objects
    const objectEndpoint = computed(() => endpoints.value?.[props.object?.type || ''] || '');
    const parentsQueryParameters = computed(() => ({
      size: tablePageSize.value,
      page: 1,
      unitId: route.params.unit as string,
      parentEndpoint: objectListEndpoint.value,
      childObjectId: props.object?.id || ''
    }));
    const parentsQueryEnabled = computed(() => !!objectEndpoint.value && !!props.object?.id && props.editParents);
    const { data: parents, isFetching: parentsLoading } = useFetchParentObjects(parentsQueryParameters, {
      enabled: parentsQueryEnabled,
      keepPreviousData: false
    });

    const childObjectsQueryParameters = computed(() => ({
      domain: route.params.domain as string,
      endpoint: objectEndpoint.value,
      id: props.object?.id || '',
      size: 9999
    }));
    const childObjectsQueryEnabled = computed(
      () => !!objectEndpoint.value && !!props.object?.id && !props.editParents && objectEndpoint.value !== 'scopes'
    );
    const { data: childObjects, isFetching: childObjectsLoading } = useQuery(
      objectQueryDefinitions.queries.fetchObjectChildren,
      childObjectsQueryParameters,
      { enabled: childObjectsQueryEnabled }
    );

    const childScopesQueryParameters = computed(() => ({
      domain: route.params.domain as string,
      id: props.object?.id || '',
      size: 9999
    }));
    const childScopesQueryEnabled = computed(
      () => !!objectEndpoint.value && !!props.object?.id && !props.editParents && objectEndpoint.value === 'scopes'
    );
    const { data: childScopes, isFetching: childScopesLoading } = useQuery(
      objectQueryDefinitions.queries.fetchScopeChildren,
      childScopesQueryParameters,
      { enabled: childScopesQueryEnabled }
    );

    const children = computed<IVeoEntity[]>(() =>
      uniqBy(
        [...(childObjects.value?.items || []), ...(childScopes.value?.items || []), ...props.preselectedItems],
        (arrayEntry) => getIdFromItem(arrayEntry)
      )
    );
    const childrenLoading = computed(() => childObjectsLoading.value || childScopesLoading.value);

    const originalSelectedItems = computed<IVeoEntity[]>(() => {
      if (props.linkRiskAffected) {
        return (
          objects.value?.items.filter((item) =>
            props.object?.controlImplementations?.some((ci) => ci.owner.id === item.id)
          ) || []
        );
      } else if (props.editParents) {
        return [...(parents.value?.items || []), ...props.preselectedItems];
      } else {
        return children.value;
      }
    }); // Doesn't get modified to compare which parents have been added removed

    const modifiedSelectedItems = ref<IVeoEntity[]>([]);
    const isDirty = computed(() => !isEqual(originalSelectedItems.value, modifiedSelectedItems.value));

    watch(
      () => originalSelectedItems.value,
      (newValue) => {
        modifiedSelectedItems.value = newValue;
      },
      { deep: true, immediate: true }
    );

    const itemsSelected = computed(() => !isEqual(originalSelectedItems.value, modifiedSelectedItems.value));

    // Linking logic
    const savingObject = ref(false); // saving status for adding entities
    const linkObjects = async () => {
      if (ability.value.cannot('manage', 'objects')) return;
      if (props.returnObjects) {
        handleReturnObjects();
      } else {
        savingObject.value = true;
        try {
          if (props.object && endpoints.value) {
            await handleObjectLinking();
          }
          emit('success');
        } catch (error) {
          emit('error', error);
        } finally {
          savingObject.value = false;
        }
      }
    };

    const handleReturnObjects = () => {
      const cleanedItems = (modifiedSelectedItems.value as any[]).map((item) => {
        const { disabled: _, ...rest } = item;
        return rest;
      });
      emit('update:preselected-items', cleanedItems);
      emit('update:model-value', false);
    };

    // Usage
    const handleObjectLinking = async () => {
      if (props.linkRiskAffected) {
        await handleLinkRiskAffected();
      } else if (props.editParents) {
        await linkOrUnlinkParents();
      } else {
        if (props.object) {
          await link(props.object, modifiedSelectedItems.value, true);
        }
      }
    };

    const handleLinkRiskAffected = async () => {
      const elementsToEdit: IVeoEntity[] = differenceBy(modifiedSelectedItems.value, originalSelectedItems.value, 'id');
      for (const element of elementsToEdit) {
        await processElement(element);
      }
    };

    const processElement = async (element: IVeoEntity) => {
      const clonedObject = await useQuerySync(
        objectQueryDefinitions.queries.fetch,
        {
          domain: route.params.domain as string,
          endpoint: endpoints.value?.[element.type] || '',
          id: element.id
        },
        queryClient
      );
      clonedObject.controlImplementations?.push({
        control: createLink('controls', props.object.id)
      });
      await updateObject({
        domain: route.params.domain,
        endpoint: endpoints.value?.[element.type] || [],
        id: clonedObject.id,
        object: clonedObject
      });
    };

    const linkOrUnlinkParents = async () => {
      const parentsToAdd = differenceBy(modifiedSelectedItems.value, originalSelectedItems.value, 'id');
      const parentsToRemove = differenceBy(originalSelectedItems.value, modifiedSelectedItems.value, 'id');

      for (const parent of parentsToAdd) {
        await fetchAndLinkParent(parent);
      }

      for (const parent of parentsToRemove) {
        await fetchAndUnlinkParent(parent);
      }
    };

    const fetchAndLinkParent = async (parent: IVeoEntity) => {
      const _parent: IVeoEntity = await fetchParent(parent);
      await link(_parent, props.object);
    };

    const fetchAndUnlinkParent = async (parent: IVeoEntity) => {
      const _parent: IVeoEntity = await fetchParent(parent);
      await unlink(_parent, props.object.id);
    };

    const fetchParent = async (parent: IVeoEntity) => {
      return await useQuerySync(
        objectQueryDefinitions.queries.fetch,
        {
          domain: route.params.domain as string,
          endpoint: endpoints.value?.[parent.type],
          id: parent.id
        },
        queryClient
      );
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
          search.value = [];
        }
      },
      {
        immediate: true
      }
    );

    const noDataTextWithLink = computed(() => {
      if (hasItems.value) return () => h(HtmlRenderer, { content: t('noSearchResults') });
      if (filter.value.objectType === 'control') {
        return () =>
          h(HtmlRenderer, {
            content: t('controlNoDataText', {
              catalogLink: `<a href="#">${t('catalog')}</a>`
            }),
            clickHandler: navigateToCatalog,
            clickHandlerParams: ['control', 'CTL_Module']
          });
      } else {
        return () =>
          h(HtmlRenderer, {
            content: t('nonControlNoDataText', {
              subType: `${upperFirst(translations.value?.lang[locale.value]?.[filter.value.objectType + '_plural'].toString())}`,
              correspondingObject: `<a href="#">${t('correspondingObject')}</a>`
            }),
            clickHandler: navigateToObject,
            clickHandlerParams: [VeoElementTypePlurals[filter.value.objectType as keyof typeof VeoElementTypePlurals]]
          });
      }
    });

    return {
      navigateToCatalog,
      ability,
      availableObjectTypes,
      childrenLoading,
      filter,
      isDirty,
      itemsSelected,
      linkObjects,
      modifiedSelectedItems,
      objectsLoading,
      page,
      parentsLoading,
      savingObject,
      selectableObjects,
      sortBy,
      title,
      updateFilter,
      noDataTextWithLink,
      globalT,
      t,
      upperFirst,
      search,
      isLoadingSearchResults
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
    "object": "object",
    "controlNoDataText": "No modules applied yet. Please apply modules from the {catalogLink}.",
    "nonControlNoDataText": "There is currently no {subType}. Please {correspondingObject}",
    "correspondingObject": "create a corresponding object.",
    "noSearchResults": "Your search did not match any results",
    "catalog": "catalog",
    "addTarget": "Add {0}"
        },
  "de": {
    "editChildObjects": "Teile von \"{0}\" bearbeiten",
    "editChildScopes": "Scopes von \"{0}\" bearbeiten",
    "editParentObjects": "Teile über \"{0}\" bearbeiten",
    "editParentScopes": "Scopes über \"{0}\" bearbeiten",
    "object": "Objekt",
    "controlNoDataText": "Bisher wurden noch keine Bausteine angewendet. Bitte zuerst Bausteine aus dem {catalogLink} anwenden.",
    "nonControlNoDataText": "Es gibt aktuell keine {subType}. Bitte {correspondingObject}",
    "correspondingObject": "legen Sie ein entsprechendes Objekt an.",
    "noSearchResults": "Ihre Suche ergab keine Treffer",
    "catalog": "Katalog",
    "addTarget": "{0} hinzufügen"
    }
}
</i18n>

<style>
#link-dialog-select-all .v-data-table__thead .v-selection-control__input {
  display: none;
}
</style>

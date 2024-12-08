<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Samuel Vitzthum
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
  <BasePage data-component-name="object-overview-page" sticky-footer>
    <template #default>
      <ObjectFilterBar
        ref="filterBar"
        class="mt-4"
        :domain-id="domainId"
        :filter="filter"
        :required-fields="['objectType']"
        @update:filter="updateRoute"
      />

      <SearchBar v-model:search="search" />

      <BaseCard v-if="filter.objectType || endpointsLoading">
        <ObjectTable
          v-model:page="page"
          v-model:sort-by="sortBy"
          :items="items"
          :loading="isLoading"
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
          :additional-headers="additionalHeaders"
          data-component-name="object-overview-table"
          enable-click
          @click="openItem"
        >
          <template #actions="{ item }">
            <div class="d-flex justify-end">
              <v-tooltip v-for="btn in actions" :key="btn.id" location="start">
                <template #activator="{ props }">
                  <v-btn
                    :data-component-name="`object-overview-${btn.id}-button`"
                    :data-veo-test="`object-overview-${btn.id}-button`"
                    :disabled="ability.cannot('manage', 'objects') || btn.disabled"
                    :icon="btn.icon"
                    v-bind="props"
                    variant="text"
                    @click="btn.action(item)"
                  />
                </template>
                {{ btn.label }}
              </v-tooltip>
            </div>
          </template>
        </ObjectTable>

        <!-- Dialogs -->
        <ObjectDeleteDialog
          :model-value="!!itemToDelete"
          :item="itemToDelete"
          @update:model-value="onCloseDeleteDialog({ isOpen: false, isCancel: true })"
          @success="onCloseDeleteDialog({ isOpen: false })"
          @error="showError('delete', itemToDelete, $event)"
        />

        <ObjectAssignDialog
          :model-value="objectAssignDialogVisible"
          :object-id="objectId"
          :object-type="objectType"
          :object-name="objectName"
          @update:model-value="objectAssignDialogVisible = false"
        />
      </BaseCard>
      <ObjectTypeError v-else>
        <v-btn color="primary" variant="text" @click="onOpenFilterDialog">
          {{ t('filterObjects') }}
        </v-btn>
      </ObjectTypeError>
    </template>
    <template #footer>
      <ObjectCreateDialog
        v-if="filter.objectType"
        v-model="createObjectDialogVisible"
        :domain-id="domainId"
        :object-type="filter.objectType"
        :sub-type="filter.subType"
      />
      <v-tooltip v-if="filter.objectType" location="start">
        <template #activator="{ props }">
          <v-btn
            color="primary"
            flat
            :disabled="ability.cannot('manage', 'objects')"
            :icon="mdiPlus"
            class="veo-primary-action-fab"
            data-component-name="create-object-button"
            v-bind="props"
            size="large"
            @click="createObjectDialogVisible = true"
          />
          <div style="height: 76px" />
        </template>
        <template #default>
          <span>{{ t('createObject', [createObjectLabel]) }}</span>
        </template>
      </v-tooltip>
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-objectType-subType';
</script>

<script setup lang="ts">
import { mdiContentCopy, mdiDotsVertical, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { omit, upperFirst } from 'lodash';
import { useFetchUnitDomains } from '~/composables/api/domains';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCloneObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';
import { useFetchObjects } from '~/composables/api/objects';
import formQueryDefinitions, { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';
import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import type { VeoSearch } from '~/types/VeoSearch';
import type { IVeoEntity } from '~/types/VeoTypes';

enum FILTER_SOURCE {
  QUERY,
  PARAMS,
  NONE
}

type IFilterDefinition = {
  [filterKey: string]: {
    source: FILTER_SOURCE;
    nullValue?: any;
  };
};

const { t, locale } = useI18n();
const { t: globalT } = useI18n({ useScope: 'global' });

const { tablePageSize } = useVeoUser();
const { ability } = useVeoPermissions();

const route = useRoute();
const { data: currentDomain } = useCurrentDomain();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { clone } = useCloneObject();

const fetchTranslationsQueryParameters = computed(() => ({
  languages: [locale.value],
  domain: route.params.domain
}));
const { data: translations, isFetching: translationsLoading } = useQuery(
  translationQueryDefinitions.queries.fetch,
  fetchTranslationsQueryParameters
);

const fetchUnitDomainsQueryParameters = computed(() => ({
  unitId: route.params.unit as string
}));
const fetchUnitDomainsQueryEnabled = computed(() => !!route.params.unit);
const { data: domains } = useFetchUnitDomains(fetchUnitDomainsQueryParameters, {
  enabled: fetchUnitDomainsQueryEnabled
});

const domainId = computed(() => route.params.domain as string);

//
// Filter stuff
//

// Ref to filter bar to programmatically open filter dialog from outside
const filterBar = ref();
const onOpenFilterDialog = () => {
  filterBar.value.filterDialogVisible = true;
};

// accepted filter keys (others wont be respected when specified in URL query parameters)

const filterDefinitions: IFilterDefinition = {
  objectType: {
    source: FILTER_SOURCE.PARAMS
  },
  subType: {
    source: FILTER_SOURCE.PARAMS,
    nullValue: '-'
  },
  abbreviation: {
    source: FILTER_SOURCE.QUERY
  },
  designator: {
    source: FILTER_SOURCE.QUERY
  },
  name: {
    source: FILTER_SOURCE.QUERY
  },
  status: {
    source: FILTER_SOURCE.QUERY
  },
  description: {
    source: FILTER_SOURCE.QUERY
  },
  updatedBy: {
    source: FILTER_SOURCE.QUERY
  },
  hasNoParentElements: {
    source: FILTER_SOURCE.QUERY
  },
  hasChildElements: {
    source: FILTER_SOURCE.QUERY
  }
};

const stringOrFirstValue = (v: string | null | (string | null)[]) => {
  if (Array.isArray(v)) {
    return v[0];
  }
  return v;
};

// filter built from URL query parameters
const { data: endpoints, isFetching: endpointsLoading } = useQuery(
  schemaQueryDefinitions.queries.fetchSchemas,
  undefined,
  { placeholderData: {} }
);

const filter = computed(() => {
  return Object.fromEntries(
    Object.entries(filterDefinitions).map(([filterKey, filterDefinition]) => {
      // Extract first query value
      let filterValue: any;
      if (filterDefinition.source === FILTER_SOURCE.QUERY) {
        filterValue = stringOrFirstValue(route.query[filterKey]);
      } else if (filterDefinition.source === FILTER_SOURCE.PARAMS) {
        filterValue = stringOrFirstValue(route.params[filterKey]);
      }
      if (filterValue === filterDefinition.nullValue) {
        filterValue = undefined;
      }

      if (filterValue === 'true') {
        filterValue = true;
      }

      // Special handling
      if (filterKey === 'objectType') {
        filterValue = Object.entries(endpoints.value || {}).find(([_, endpoint]) => endpoint === filterValue)?.[0];
      }

      return [filterKey, filterValue];
    })
  ) as Record<string, string | undefined>;
});

//
// table stuff
//
const page = ref(0);
const sortBy = ref([{ key: 'name', order: 'asc' }]);
const resetQueryOptions = () => {
  page.value = 0;
  sortBy.value = [{ key: 'name', order: 'asc' }];
};

const combinedQueryParameters = computed<any>(() => ({
  size: tablePageSize.value,
  sortBy: sortBy.value[0].key,
  sortOrder: sortBy.value[0].order,
  page: page.value,
  unit: route.params.unit as string,
  ...omit(filter.value, 'objectType'),
  endpoint: endpoints.value?.[filter.value.objectType as string],
  domain: route.params.domain
}));
const queryEnabled = computed(() => !!endpoints.value?.[filter.value.objectType as string]);
const { data: _items, isFetching: isLoadingObjects } = useFetchObjects(combinedQueryParameters, {
  enabled: queryEnabled,
  keepPreviousData: true
});

// SEARCH
// v-model from `SearchBar`
const search = ref<VeoSearch[]>([]);

// get search results
const { data: searchResults, isLoading: isLoadingSearchResults } = useSearch({
  baseQueryParameters: combinedQueryParameters,
  search
});

// items rendered in ObjectTable
const items = computed(() => (search.value.length ? searchResults.value : _items.value) || []);

const formsQueryParameters = computed(() => ({ domainId: domainId.value }));
const formsQueryEnabled = computed(() => !!domainId.value);
const { data: formSchemas } = useQuery(formQueryDefinitions.queries.fetchForms, formsQueryParameters, {
  enabled: formsQueryEnabled,
  placeholderData: []
});

const isLoading = computed(() => isLoadingObjects.value || translationsLoading.value || isLoadingSearchResults.value);

watch(() => filter.value, resetQueryOptions, { deep: true });

// Update query parameters but keep other route options
const updateRoute = async (newValue: Record<string, string | undefined | null | true>) => {
  const routeDetails = {
    name: ROUTE_NAME,
    query: {} as Record<string, string>,
    params: {} as Record<string, string>
  };
  Object.entries(newValue).forEach(([filterKey, filterValue]) => {
    // Special handling
    if (filterKey === 'objectType') {
      filterValue = endpoints.value?.[filterValue as string];
    }

    if (filterValue === undefined && filterDefinitions[filterKey].nullValue !== undefined) {
      if (filterDefinitions[filterKey].source === FILTER_SOURCE.PARAMS) {
        routeDetails.params[filterKey] = filterDefinitions[filterKey].nullValue;
      } else {
        routeDetails.query[filterKey] = filterDefinitions[filterKey].nullValue;
      }
    } else {
      if (filterDefinitions[filterKey].source === FILTER_SOURCE.PARAMS) {
        routeDetails.params[filterKey] = filterValue as string;
      } else {
        routeDetails.query[filterKey] = filterValue as string;
      }
    }
  });
  await navigateTo(routeDetails);
};

const formatObjectLabel = (label: string, value?: string) => {
  switch (label) {
    // translated object type
    case 'objectType':
      return value ? translations.value?.lang[locale.value]?.[value] : undefined;
    // translated sub type
    case 'subType':
      return (
        (formSchemas.value as IVeoFormSchemaMeta[]).find((formschema) => formschema.subType === value)?.name?.[
          locale.value
        ] || value
      );
  }
};

const createObjectLabel = computed(() =>
  filter.value.subType ?
    formatObjectLabel('subType', filter.value.subType)
  : formatObjectLabel('objectType', filter.value.objectType)
);

const showError = (messageKey: 'clone' | 'delete', _item: IVeoEntity | undefined, error: Error) => {
  displayErrorMessage(t(`errors.${messageKey}`).toString(), error?.toString());
};

const openItem = ({ item }: { item: any }) => {
  return navigateTo({
    name: OBJECT_DETAIL_ROUTE,
    params: {
      ...route.params,
      object: item.id
    }
  });
};

//
// CRUD stuff
//

// Create object
const createObjectDialogVisible = ref(false);

// Delete object
const itemToDelete = ref<IVeoEntity>();
const resetItemToDelete = () => (itemToDelete.value = undefined);

const onCloseDeleteDialog = ({ isOpen, isCancel = false }: { isOpen: boolean; isCancel?: boolean }) => {
  if (!isOpen && isCancel) {
    return resetItemToDelete();
  }
  if (!isOpen && !isCancel) {
    displaySuccessMessage(t('objectDeleted'));
    return resetItemToDelete();
  }
};

const objectAssignDialogVisible = ref(false);
const objectName = ref<string>();

const objectId = ref<string>();
const objectType = ref<string>();

const actions = computed(() => [
  {
    id: 'clone',
    label: upperFirst(t('cloneObject')),
    icon: mdiContentCopy,
    async action(item: any) {
      try {
        const { resourceId: clonedObjectId } = await clone(item);
        displaySuccessMessage(t('cloneSuccess'), {
          actions: [
            {
              text: t('open'),
              onClick: () => {
                return navigateTo({
                  name: OBJECT_DETAIL_ROUTE,
                  params: {
                    ...route.params,
                    object: clonedObjectId
                  }
                });
              }
            }
          ]
        });
      } catch (e: any) {
        showError('clone', item, e);
      }
    }
  },
  {
    id: 'delete',
    label: upperFirst(t('deleteObject')),
    icon: mdiTrashCanOutline,
    action(item: any) {
      itemToDelete.value = item;
    }
  },
  {
    disabled: domains.value?.length <= 1,
    id: 'assign',
    label: t('assignObject'),
    icon: mdiDotsVertical,
    action(item: any) {
      objectAssignDialogVisible.value = true;
      objectId.value = item.id;
      objectType.value = item.type;
      objectName.value = item.name;
    }
  }
]);

// Additional headers
const SUBTYPES_WITH_VDA = ['CTL_Requirement', 'CTL_PartialRequirement', 'CTL_Safeguard', '-'];
// @ts-ignore TODO #3066 cannot find name
const additionalHeaders = computed<ObjectTableHeader[]>(() =>
  filter.value.objectType === 'process' && filter.value.subType === 'PRO_DataProcessing' ?
    [
      {
        priority: 31,
        order: 51,
        key: `domains.${domainId.value}.decisionResults.piaMandatory.value`,
        value: `domains.${domainId.value}.decisionResults.piaMandatory.value`,
        render: ({ item }: any) =>
          h(
            'div',
            item.raw?.decisionResults?.piaMandatory?.value ?
              globalT('global.button.yes').toString()
            : globalT('global.button.no').toString()
          ),
        text: t('dpiaMandatory').toString(),
        sortable: false,
        width: 210
      }
    ]
  : (
    (!filter.value.subType || SUBTYPES_WITH_VDA.includes(filter.value.subType as string)) &&
    currentDomain.value?.raw?.elementTypeDefinitions?.[filter.value.objectType as string]?.customAspects
      ?.control_bpInformation
  ) ?
    [
      {
        priority: 100,
        order: 31,
        key: `customAspects.control_bpInformation.control_bpInformation_protectionApproach`,
        value: `customAspects.control_bpInformation.control_bpInformation_protectionApproach`,
        render: ({ item }: any) => {
          return h(
            'div',
            translations.value?.lang?.[locale.value]?.[
              item.customAspects?.control_bpInformation?.control_bpInformation_protectionApproach
            ] ?? ''
          );
        },
        text: t('VdA').toString(),
        sortable: false,
        width: 80
      }
    ]
  : []
);
</script>

<i18n>
{
  "en": {
    "assignObject": "Assign object to another domain",
    "filterObjects": "filter objects",
    "createObject": "create {0}",
    "clone": "duplicated",
    "cloneObject": "clone object",
    "cloneSuccess": "Object cloned successfully.",
    "deleteObject": "delete object",
    "dpiaMandatory": "Privacy impact assessment required",
    "errors": {
      "clone": "Could not clone object",
      "delete": "Could not delete object"
    },
    "objectDeleted": "Object deleted.",
    "open": "Open",
    "VdA": "Procedure for securing"
  },
  "de": {
    "assignObject": "Objekt einer weiteren Domäne zuordnen",
    "filterObjects": "Objekte filtern",
    "createObject": "{0} erstellen",
    "clone": "dupliziert",
    "cloneObject": "objekt duplizieren",
    "cloneSuccess": "Objekt wurde erfolgreich dupliziert.",
    "deleteObject": "objekt löschen",
    "dpiaMandatory": "DSFA verpflichtend",
    "errors": {
      "clone": "Das Objekt konnte nicht dupliziert werden",
      "delete": "Das Objekt konnte nicht gelöscht werden"
    },
    "objectDeleted": "Objekt wurde gelöscht.",
    "open": "Öffnen",
    "VdA": "Vorgehensweise der Absicherung"
  }
}
</i18n>

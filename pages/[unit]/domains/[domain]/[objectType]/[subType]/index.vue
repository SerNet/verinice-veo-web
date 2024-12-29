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
  <BasePage data-component-name="object-overview-page" :title="`${route.params.objectType}`" sticky-footer>
    <template #default>
      <ObjectFilterBar
        ref="filterBar"
        class="mt-4"
        :domain-id="domainId"
        :filter="filter"
        :required-fields="['objectType']"
        :available-object-types="availableSubTypes"
        @update:filter="updateRoute"
      />

      <div class="actions">
        <div class="actions__bulk__wrapper" :class="{ visible: selectedItems.length > 0 }">
          <v-btn
            v-if="selectedItems.length > 0"
            :icon="mdiTrashCanOutline"
            variant="text"
            class="trash-btn ma-3"
            @click="onBulkDelete"
          />
        </div>
        <div class="search-wrapper" :class="{ 'search-shrunk': selectedItems.length > 0 }">
          <SearchBar v-model:search="search" />
        </div>
      </div>
      <FeatureFlagsFeatureSwitch feature-key="cardView" :label="{ on: t('cardViewOn'), off: t('cardViewOff') }" />
      <v-scale-transition>
        <template v-if="filter.objectType">
          <!-- Card View -->
          <ObjectCardView
            v-if="hasFeature('cardView')"
            :card-items="cardItems"
            :fetched-items="_items"
            :sort-by="sortBy"
            :actions="actions"
            :translations="translations"
            :cards-page-change="cardsPageChange"
          />
          <!-- Table View -->
          <BaseCard v-else>
            <ObjectTable
              :key="tableKey"
              v-model="selectedItems"
              v-model:page="page"
              v-model:sort-by="sortBy"
              :items="items"
              :loading="isLoading"
              :default-headers="[
                'icon',
                'designator',
                'abbreviation',
                'status',
                'description',
                'updatedBy',
                'updatedAt',
                'actions'
              ]"
              :additional-headers="additionalHeaders"
              show-select
              data-component-name="object-overview-table"
              enable-click
              @click="openItem"
            >
              <template #actions="{ item }">
                <div class="d-flex justify-end">
                  <v-tooltip v-for="btn in actions" :key="btn.id" location="start" :aria-label="btn.label">
                    <template #activator="{ props }">
                      <v-btn
                        :data-component-name="`object-overview-${btn.id}-button`"
                        :data-veo-test="`object-overview-${btn.id}-button`"
                        :disabled="ability.cannot('manage', 'objects') || btn.disabled"
                        :icon="btn.icon"
                        v-bind="props"
                        variant="text"
                        :aria-label="btn.label"
                        @click="btn.action(item)"
                      />
                    </template>
                    {{ btn.label }}
                  </v-tooltip>
                </div>
              </template>
            </ObjectTable>
          </BaseCard>
        </template>
        <ObjectTypeError v-else>
          <v-btn color="primary" variant="text" @click="onOpenFilterDialog">
            {{ t('filterObjects') }}
          </v-btn>
        </ObjectTypeError>
      </v-scale-transition>

      <!-- Dialogs -->
      <ObjectDeleteDialog
        :model-value="showDeleteDialog"
        :items="itemsToDelete"
        @update:model-value="onCloseDeleteDialog({ isOpen: false, isCancel: true })"
        @success="onCloseDeleteDialog({ isOpen: false }, $event)"
        @error="showError('delete', $event)"
      />

      <ObjectAssignDialog
        :model-value="objectAssignDialogVisible"
        :object-id="objectId"
        :object-type="objectType"
        :object-name="objectName"
        @update:model-value="objectAssignDialogVisible = false"
      />
    </template>
    <template #footer>
      <ObjectCreateDialog
        v-if="filter.objectType"
        v-model="createObjectDialogVisible"
        :domain-id="domainId"
        :object-type="filter.objectType"
        :sub-type="filter.subType || selectedSubtypeForCreateDialog"
      />
      <v-tooltip v-if="filter.objectType" location="start" :aria-label="t('createObject', [createObjectLabel])">
        <template #activator="{ props }">
          <UtilNestedMenu v-if="!filter.subType" location="bottom right" :items="nestedActions">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="mergeProps($attrs, menuProps, props)"
                color="primary"
                flat
                class="veo-primary-action-fab"
                data-component-name="create-object-button"
                size="large"
                :disabled="!nestedActions.length || ability.cannot('manage', 'objects')"
                :aria-label="t('createObject', [createObjectLabel])"
                :icon="mdiPlus"
              />
            </template>
          </UtilNestedMenu>
          <v-btn
            v-else
            color="primary"
            flat
            :disabled="ability.cannot('manage', 'objects')"
            :icon="mdiPlus"
            class="veo-primary-action-fab"
            data-component-name="create-object-button"
            v-bind="props"
            :aria-label="t('createObject', [createObjectLabel])"
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
import { mdiContentCopy, mdiPlus, mdiPuzzleOutline, mdiTrashCanOutline } from '@mdi/js';
import { omit, upperFirst } from 'lodash';
import { useFetchUnitDomains } from '~/composables/api/domains';
import { mergeProps } from 'vue';

import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCloneObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';
import type { INestedMenuEntries } from '~/components/util/NestedMenu.vue';
import { OBJECT_TYPE_ICONS } from '~/components/object/Icon.vue';
import { useFetchObjects } from '~/composables/api/objects';
import formQueryDefinitions, { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';
import { useFeatureFlag } from '~/composables/features/featureFlag';
import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';
import type { VeoSearch } from '~/types/VeoSearch';
import { type IVeoEntity, VeoElementTypePlurals, VeoElementTypesSingular } from '~/types/VeoTypes';
import ObjectCreateDialog from '~/components/object/CreateDialog.vue';
import { useCurrentDomainUtils } from '~/composables/domains/useDomains';

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
const { getSubType } = useCurrentDomainUtils();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { clone } = useCloneObject();
const { hasFeature } = useFeatureFlag();

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
        filterValue = VeoElementTypesSingular[filterValue];
      }

      return [filterKey, filterValue];
    })
  ) as Record<string, string | undefined>;
});
//
// table stuff
//
const page = ref(0);
const cardsPageChange = (value: number) => {
  page.value = value - 1;
};
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
  endpoint: VeoElementTypePlurals[filter.value.objectType as string],
  domain: route.params.domain
}));
const queryEnabled = computed(() => !!VeoElementTypePlurals[filter.value.objectType as string]);
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
const cardItems = computed(() => {
  const results = searchResults.value?.items;
  if (results) return results;
  return _items.value.items;
});

const formsQueryParameters = computed(() => ({ domainId: domainId.value }));
const formsQueryEnabled = computed(() => !!domainId.value);
const { data: formSchemas } = useQuery(formQueryDefinitions.queries.fetchForms, formsQueryParameters, {
  enabled: formsQueryEnabled,
  placeholderData: []
});

const selectedSubtypeForCreateDialog = ref<string>('');

const availableSubTypes = computed(() => {
  return getSubType(filter.value.objectType).value;
});
const nestedActions = computed<INestedMenuEntries[]>(() => {
  return formSchemas.value
    ?.filter((formschema) => formschema.modelType === filter.value.objectType)
    .map((f) => ({
      key: f.id,
      title: f.name[locale.value],
      icon: OBJECT_TYPE_ICONS.get(filter.value.objectType)?.icon as string,
      subType: f.subType,
      callback: (entry: INestedMenuEntries) => {
        selectedSubtypeForCreateDialog.value = entry.subType;
        createObjectDialogVisible.value = true;
      }
    }));
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
      filterValue = VeoElementTypePlurals[filterValue as string];
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

const showError = (messageKey: 'clone' | 'delete', error: Error) => {
  displayErrorMessage(t(`errors.${messageKey}`).toString(), error?.toString());
};

const openItem = ({ item }: { item: any }) => {
  return navigateTo({
    name: OBJECT_DETAIL_ROUTE,
    params: {
      ...route.params,
      object: item.id,
      subType: item.subType
    }
  });
};

//
// CRUD stuff
//

// Create object
const createObjectDialogVisible = ref(false);

// Delete object
const itemsToDelete = ref<IVeoEntity[]>([]);
const resetItemsToDelete = () => {
  showDeleteDialog.value = false;
  itemsToDelete.value = [];
};
const onCloseDeleteDialog = (
  { isOpen, isCancel = false }: { isOpen: boolean; isCancel?: boolean },
  multiple?: boolean
) => {
  if (!isOpen && isCancel) {
    return resetItemsToDelete();
  }
  if (!isOpen && !isCancel) {
    displaySuccessMessage(multiple ? t('objectsDeleted') : t('objectDeleted'));
    selectedItems.value = [];
    tableKey.value += 1;
    return resetItemsToDelete();
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
        showError('clone', e);
      }
    }
  },
  {
    id: 'delete',
    label: upperFirst(t('deleteObject')),
    icon: mdiTrashCanOutline,
    action(item: any) {
      itemsToDelete.value = [item];
      showDeleteDialog.value = true;
    }
  },
  {
    disabled: domains.value?.length <= 1,
    id: 'assign',
    label: t('assignObject'),
    icon: mdiPuzzleOutline,
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
const additionalHeaders = computed<ObjectTableHeader[]>(() => {
  const baseHeader: any = [
    {
      value: 'name',
      key: 'name',
      cellClass: ['font-weight-bold'],
      width: 100,
      truncate: true,
      sortable: true,
      priority: 100,
      order: 20,
      render: ({ item }: any) => {
        const href = `/${route.params.unit}/domains/${route.params.domain}/${VeoElementTypePlurals[item.type as keyof typeof VeoElementTypePlurals]}/${item.subType}/${item.id}/`;
        return h(
          resolveComponent('router-link'),
          {
            to: href,
            style: {
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: 'bold'
            }
          },
          { default: () => item.name ?? '' }
        );
      }
    }
  ];

  if (filter.value.objectType === 'process' && filter.value.subType === 'PRO_DataProcessing') {
    baseHeader.push({
      priority: 100,
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
    });
  } else if (
    (!filter.value.subType || SUBTYPES_WITH_VDA.includes(filter.value.subType as string)) &&
    currentDomain.value?.raw?.elementTypeDefinitions?.[filter.value.objectType as string]?.customAspects
      ?.control_bpInformation
  ) {
    baseHeader.push({
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
    });
  }

  return baseHeader;
});

const tableKey = ref(0);
const selectedItems = ref<IVeoEntity[]>([]);
const showDeleteDialog = ref(false);
const onBulkDelete = () => {
  itemsToDelete.value = selectedItems.value;
  showDeleteDialog.value = true;
};
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-object-type-sub-type-index.json"></i18n>

<style scoped lang="scss">
.actions {
  position: relative;
  display: flex;
  align-items: center;
  justify-items: center;
}

.actions__bulk__wrapper {
  position: absolute;
  left: 0;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.4s ease;
  margin-bottom: 22px;
}

.actions__bulk__wrapper.visible {
  opacity: 1;
}

.search-wrapper {
  width: 100%;
  margin-left: 0;
  transition:
    margin-left 0.2s ease,
    width 0.2s ease;
}

.search-shrunk {
  width: calc(100% - 72px);
  margin-left: 72px;
}
</style>

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
  <BasePage data-component-name="object-overview-page" :title="`${pageTitle}`" sticky-footer>
    <template #default>
      <div class="filter-row">
        <div class="filter-section">
          <ObjectFilterBar
            ref="filterBar"
            class="my-0 py-0"
            :domain-id="domainId"
            :filter="filter"
            :required-fields="['objectType']"
            :available-object-types="availableSubTypes"
            @update:filter="updateRoute"
          />
        </div>
      </div>

      <div class="actions py-0 my-0">
        <div class="actions__bulk__wrapper" :class="{ visible: selectedItems.length > 0 }">
          <v-tooltip location="start" :aria-label="t('deleteObjects')">
            <template #activator="{ props }">
              <v-btn
                v-if="selectedItems.length > 0"
                :icon="mdiTrashCanOutline"
                variant="text"
                class="trash-btn"
                v-bind="props"
                density="compact"
                size="small"
                data-component-name="bulk-delete-button"
                @click="onBulkDelete"
              />
            </template>
            {{ t('deleteObjects') }}
          </v-tooltip>
          <v-tooltip location="start" :aria-label="t('assignObjects')">
            <template #activator="{ props }">
              <v-btn
                v-if="selectedItems.length > 0"
                :disabled="!domains || domains.length <= 1"
                :icon="mdiPuzzleOutline"
                variant="text"
                class="assign-btn"
                v-bind="props"
                density="compact"
                size="small"
                data-component-name="bulk-assign-button"
                @click="onBulkAssign"
              />
            </template>
            {{ t('assignObjects') }}
          </v-tooltip>
        </div>
        <div class="search-wrapper" :class="{ 'search-shrunk': selectedItems.length > 0 }">
          <SearchBar v-model:search="search" density="compact" />
        </div>
      </div>

      <template v-if="filter.objectType">
        <!-- Card View -->

        <ObjectCardView
          v-if="hasCardView"
          :is-card-view-visible="hasCardView"
          :card-items="items.items ?? []"
          :fetched-items="items"
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
              'name',
              'abbreviation',
              'status',
              'description',
              'updatedBy',
              'updatedAt',
              'actions'
            ]"
            :additional-headers="additionalHeaders"
            show-select
            enable-links
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
                      density="compact"
                      size="x-small"
                      class="mr-3"
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

      <!-- Dialogs -->
      <ObjectDeleteDialog
        :model-value="showDeleteDialog"
        :items="selectedOperationItems"
        @update:model-value="onCloseDeleteDialog({ isOpen: false, isCancel: true })"
        @success="onCloseDeleteDialog({ isOpen: false }, $event)"
        @error="showError('delete', $event)"
      />

      <ObjectAssignDialog
        :model-value="objectAssignDialogVisible"
        :objects="selectedOperationItems"
        @update:model-value="resetOperationItems"
      />
      <CsvImportCard
        :object-type="filter.objectType"
        :sub-type="filter.subType"
        :required-fields="['name']"
        @navigate="handleNavigate"
      />
    </template>
    <template #footer>
      <ObjectCreateDialog
        v-if="filter.objectType && createObjectDialogVisible"
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
import { mergeProps } from 'vue';
import { useFetchUnitDomains } from '~/composables/api/domains';

import { OBJECT_TYPE_ICONS } from '~/components/object/Icon.vue';
import type { INestedMenuEntries } from '~/components/util/NestedMenu.vue';
import { useFetchObjects } from '~/composables/api/objects';
import formQueryDefinitions, { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';
import { hasFeature } from '~/utils/featureFlags';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCloneObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';
import { type IVeoEntity, VeoElementTypePlurals, VeoElementTypesSingular } from '~/types/VeoTypes';

import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';

import ObjectCreateDialog from '~/components/object/CreateDialog.vue';
import CsvImportCard from '~/components/object/CsvImportCard.vue';
import { useCurrentDomainUtils } from '~/composables/domains/useDomains';
import type { VeoSearch } from '~/types/VeoSearch';
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
// CardView Feature
const hasCardView = hasFeature('cardView');
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
const sortBy = ref([
  route.query.sortOrder ? { key: route.query.sortBy, order: route.query.sortOrder } : { key: 'name', order: 'asc' }
]);
const resetQueryOptions = () => {
  page.value = 0;
  sortBy.value = [{ key: 'name', order: 'asc' }];
};

watch(
  filter,
  () => {
    if (hasFeature('urlParams')) return;
    resetQueryOptions();
  },
  { deep: true }
);

function resetPage() {
  page.value = 0;
}

watch(
  () => route.query,
  (newValue, oldValue) => {
    if (!hasFeature('urlParams')) return;
    if (newValue?.page !== oldValue?.page) return;
    resetPage();
  }
);

const search = ref<VeoSearch[]>([]);

const combinedQueryParameters = computed<any>(() => ({
  size: tablePageSize.value,
  sortBy: sortBy.value[0].key,
  sortOrder: sortBy.value[0].order,
  page: page.value,
  unit: route.params.unit as string,
  ...omit(filter.value, 'objectType'),
  endpoint: VeoElementTypePlurals[filter.value.objectType as string],
  domain: route.params.domain,
  ...getSearchQueryParameters(search.value)
}));

// Sync request parameters with URL query parameters, if enabled
const { queryParams } =
  hasFeature('urlParams') ? useQueryParams(combinedQueryParameters) : { queryParams: combinedQueryParameters };

const queryEnabled = computed(() => !!VeoElementTypePlurals[filter.value.objectType as string]);
const { data: items, isFetching: isLoadingObjects } = useFetchObjects(queryParams, {
  enabled: queryEnabled,
  keepPreviousData: true
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

const isLoading = computed(() => isLoadingObjects.value || translationsLoading.value);

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
const getPluralLabel = (objectType?: string): string => {
  if (!objectType) return '';

  const langData = translations.value?.lang?.[locale.value];
  return langData?.[`${objectType}_plural`] ?? '';
};

const createObjectLabel = computed(() =>
  filter.value.subType ?
    formatObjectLabel('subType', filter.value.subType)
  : formatObjectLabel('objectType', filter.value.objectType)
);

const pageTitle = computed(() => getPluralLabel(filter.value.objectType));

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
const selectedOperationItems = ref<IVeoEntity[]>([]);
const resetOperationItems = () => {
  showDeleteDialog.value = false;
  objectAssignDialogVisible.value = false;
  selectedOperationItems.value = [];
};
const onCloseDeleteDialog = (
  { isOpen, isCancel = false }: { isOpen: boolean; isCancel?: boolean },
  multiple?: boolean
) => {
  if (!isOpen && isCancel) {
    return resetOperationItems();
  }
  if (!isOpen && !isCancel) {
    displaySuccessMessage(multiple ? t('objectsDeleted') : t('objectDeleted'));
    selectedItems.value = [];
    tableKey.value += 1;
    return resetOperationItems();
  }
};

const objectAssignDialogVisible = ref(false);

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
      selectedOperationItems.value = [item];
      showDeleteDialog.value = true;
    }
  },
  {
    disabled: domains.value?.length <= 1,
    id: 'assign',
    label: t('assignObject'),
    icon: mdiPuzzleOutline,
    action(item: any) {
      selectedOperationItems.value = [item];
      objectAssignDialogVisible.value = true;
    }
  }
]);

// Additional headers
const SUBTYPES_WITH_VDA = ['CTL_Requirement', 'CTL_PartialRequirement', 'CTL_Safeguard', '-'];

// @ts-ignore TODO #3066 cannot find name
const additionalHeaders = computed<ObjectTableHeader[]>(() => {
  const baseHeader: any = [];

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
  selectedOperationItems.value = selectedItems.value;
  showDeleteDialog.value = true;
};

const onBulkAssign = () => {
  selectedOperationItems.value = selectedItems.value;
  objectAssignDialogVisible.value = true;
};

const handleNavigate = async (objectType: string, subType: string) => {
  try {
    await navigateTo({
      name: ROUTE_NAME,
      params: {
        domain: route.params.domain,
        unit: route.params.unit,
        objectType: VeoElementTypePlurals[objectType as keyof typeof VeoElementTypePlurals],
        subType: subType || ''
      }
    });
  } catch (err: unknown) {
    handleError('Failed to navigate to object overview', err);
  }
};

const handleError = (message: string, error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  displayErrorMessage(message, errorMessage);
};
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-object-type-sub-type-index.json"></i18n>

<style scoped lang="scss">
.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.filter-section {
  flex: 1;
  display: flex;
  align-items: center;
}

.toggle-section {
  display: flex;
  align-items: center;

  :deep(.v-switch) {
    margin: 0;
    padding: 0;
  }

  :deep(.v-switch__track) {
    opacity: 0.7;
  }

  :deep(.v-label) {
    font-size: 13px;
    opacity: 0.85;
    margin-left: 4px;
  }
}

.actions {
  position: relative;
  display: flex;
  align-items: center;
  justify-items: center;
}

.actions__bulk__wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  left: 0;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.4s ease;
  height: 100%;
  width: 48px;
  gap: 2px;
}

.actions__bulk__wrapper.visible {
  opacity: 1;
}

.search-wrapper {
  flex: 1;
  width: 100%;
  margin-left: 0;
  transition:
    margin-left 0.2s ease,
    width 0.2s ease;
}

.search-shrunk {
  width: calc(100% - 48px);
  margin-left: 48px;
}
</style>

<style lang="scss">
/* Hidden File Input */
.hidden {
  display: none;
}

/* Drop Zone Styles */
.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 20px;
  text-align: center;
  margin: 20px 0;
  color: #777;
  background-color: #f9f9f9;
  cursor: pointer;
}

.drop-zone:hover {
  background-color: #e6e6e6;
}

.error {
  color: red;
}

.import-container {
  max-width: 800px;
  margin: 2rem auto;
}

.upload-card {
  padding: 2rem;
  text-align: center;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.drag-active {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}
</style>

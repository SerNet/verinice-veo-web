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
  <BasePage data-component-name="object-overview-page" :title="`${pageTitle}`" sticky-footer :has-title-bg="false">
    <template #default>
      <div class="toolbar my-6">
        <div class="toolbar-search">
          <SearchBar :search="search" :filters="searchFilters" density="compact" />
        </div>
        <span class="toolbar-right">
          <v-btn
            flat
            data-component-name="csv-button"
            color="primary"
            :prepend-icon="mdiUpload"
            @click="hasCSVImport = true"
            >{{ t('csvButtonText') }}</v-btn
          >
          <ObjectCreateButton :filter="filter" />
        </span>
      </div>
      <div class="actions-wrapper mx-5 mb-2">
        <span :style="{ opacity: !hasSelection ? 0.4 : 1 }">
          {{ t('selectedCount', { count: selectedCount }) }}
        </span>
        <v-divider vertical class="mx-2" />
        <v-tooltip
          location="start"
          :aria-label="!canManageUnitContent ? t('permissions.missingPermissionTooltip') : t('deleteObjects')"
        >
          <template #activator="{ props }">
            <span v-bind="props">
              <v-btn
                :icon="mdiTrashCanOutline"
                variant="text"
                density="compact"
                size="small"
                :aria-label="t('deleteObjects')"
                data-component-name="bulk-delete-button"
                :disabled="!canManageUnitContent || !hasSelection"
                @click="onBulkDelete"
              />
            </span>
          </template>
          {{ !canManageUnitContent ? t('permissions.missingPermissionTooltip') : t('deleteObjects') }}
        </v-tooltip>
        <v-tooltip
          location="start"
          :aria-label="!canManageUnitContent ? t('permissions.missingPermissionTooltip') : t('assignObjects')"
        >
          <template #activator="{ props }">
            <span v-bind="props">
              <v-btn
                :disabled="!canManageUnitContent || !domains || domains.length <= 1 || !hasSelection"
                :icon="mdiPuzzleOutline"
                variant="text"
                density="compact"
                class="mx-2"
                size="small"
                :aria-label="t('assignObjects')"
                data-component-name="bulk-assign-button"
                @click="onBulkAssign"
              />
            </span>
          </template>
          {{ !canManageUnitContent ? t('permissions.missingPermissionTooltip') : t('assignObjects') }}
        </v-tooltip>
      </div>
      <template v-if="filter.objectType">
        <BaseCard>
          <ObjectTable
            :key="tableKey"
            v-model="selectedItems"
            v-model:page="page"
            v-model:sort-by="sortBy"
            :items="items"
            :loading="isLoading"
            :default-headers="[
              'icon',
              'source',
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
                <v-tooltip
                  v-for="btn in actions"
                  :key="btn.id"
                  location="start"
                  :aria-label="
                    !canManageUnitContent || btn.disabled ? t('permissions.missingPermissionTooltip') : btn.label
                  "
                >
                  <template #activator="{ props }">
                    <span v-bind="props">
                      <v-btn
                        :data-component-name="`object-overview-${btn.id}-button`"
                        :data-veo-test="`object-overview-${btn.id}-button`"
                        :disabled="!canManageUnitContent || btn.disabled"
                        :icon="btn.icon"
                        variant="text"
                        density="compact"
                        size="x-small"
                        class="mr-3"
                        :aria-label="
                          !canManageUnitContent || btn.disabled ? t('permissions.missingPermissionTooltip') : btn.label
                        "
                        @click="btn.action(item)"
                      />
                    </span>
                  </template>
                  {{ !canManageUnitContent || btn.disabled ? t('permissions.missingPermissionTooltip') : btn.label }}
                </v-tooltip>
              </div>
            </template>
          </ObjectTable>
        </BaseCard>
      </template>

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
      <ObjectCsvImportCard
        v-if="hasCSVImport"
        :model-value="hasCSVImport"
        :object-type="filter.objectType"
        :sub-type="filter.subType"
        :required-fields="['name']"
        @navigate="handleNavigate"
        @close="hasCSVImport = false"
      />
    </template>
  </BasePage>
</template>

<script lang="ts">
export const ROUTE_NAME = 'unit-domains-domain-objectType-subType';
</script>

<script setup lang="ts">
import { mdiContentCopy, mdiPuzzleOutline, mdiTrashCanOutline, mdiUpload } from '@mdi/js';
import { omit, upperFirst } from 'lodash';
import { useFetchObjects } from '~/composables/api/objects';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCloneObject } from '~/composables/VeoObjectUtilities';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';
import { type IVeoEntity, VeoElementTypePlurals, VeoElementTypesSingular } from '~/types/VeoTypes';

import { ROUTE_NAME as OBJECT_DETAIL_ROUTE } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/[object].vue';

import type { VeoSearch } from '~/types/VeoSearch';
import { useObjectSearchFilters } from '~/composables/search/objectFilters';

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

const route = useRoute();
const { data: currentDomain } = useCurrentDomain();
const { displayErrorMessage, displaySuccessMessage } = useVeoAlerts();
const { clone } = useCloneObject();

const { data: translations, isLoading: isLoadingTranslations } = useTranslations();
const { data: currentUnit } = useUnit();
const domains = computed(() => currentUnit.value?.domains || []);

const domainId = computed(() => route.params.domain as string);

const selectedCount = computed(() => selectedItems.value.length);
const hasSelection = computed(() => selectedCount.value > 0);
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

// Table
const page = ref(0);

const sortBy = ref([{ key: 'name', order: 'asc' }]);
const resetQueryOptions = () => {
  page.value = 0;
  sortBy.value = [{ key: 'name', order: 'asc' }];
};

watch(filter, resetQueryOptions, { deep: true });

const objectType = computed(() => VeoElementTypesSingular[route.params.objectType as string]);

const search = computed<VeoSearch[]>(() => {
  const result: VeoSearch[] = [];

  if (route.params.objectType) {
    result.push({
      searchFilter: t('objectType'),
      operator: '=',
      term: objectType.value ?? String(route.params.objectType)
    });
  }

  if (route.params.subType && route.params.subType !== '-') {
    result.push({
      searchFilter: t('subType'),
      operator: '=',
      term:
        currentDomain.value?.raw?.elementTypeDefinitions?.[objectType.value]?.translations?.[locale.value]?.[
          `${objectType.value}_${route.params.subType}_singular`
        ] ?? String(route.params.subType)
    });
  }
  if (route.query.status) {
    result.push({
      searchFilter: t('status'),
      operator: '=',
      term: String(route.query.status)
    });
  }

  return result;
});

const searchFilters = useObjectSearchFilters({
  domainId,
  excludedKeys: ['objectType', 'subType'],
  filter
});

const combinedQueryParameters = computed<any>(() => ({
  size: tablePageSize.value,
  sortBy: sortBy.value[0].key,
  sortOrder: sortBy.value[0].order,
  page: page.value,
  unit: route.params.unit as string,
  ...omit(filter.value, 'objectType'),
  endpoint: VeoElementTypePlurals[filter.value.objectType as string],
  domain: route.params.domain,
  ...getSearchQueryParameters(
    search.value,
    searchFilters.value.all.map((filter) => filter.key)
  )
}));

const queryEnabled = computed(() => !!VeoElementTypePlurals[filter.value.objectType as string]);
const { data: items, isFetching: isLoadingObjects } = useFetchObjects(combinedQueryParameters, {
  enabled: queryEnabled,
  keepPreviousData: true
});

const isLoading = computed(() => isLoadingObjects.value || isLoadingTranslations.value);

const getPluralLabel = (objectType?: string): string => {
  if (!objectType) return '';

  const langData = translations.value?.lang?.[locale.value];
  return langData?.[`${objectType}_plural`] ?? '';
};

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

const { ability, subject } = useVeoPermissions();
const canManageUnitContent = computed(() =>
  ability.value.can('manage', subject('units', { id: route.params.unit as string }))
);

const actions = computed(() => {
  const cannotManageUnits = !canManageUnitContent.value;

  return [
    {
      disabled: cannotManageUnits,
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
      disabled: cannotManageUnits,
      id: 'delete',
      label: upperFirst(t('deleteObject')),
      icon: mdiTrashCanOutline,
      action(item: any) {
        selectedOperationItems.value = [item];
        showDeleteDialog.value = true;
      }
    },
    {
      disabled: domains.value?.length <= 1 || cannotManageUnits,
      id: 'assign',
      label: t('assignObject'),
      icon: mdiPuzzleOutline,
      action(item: any) {
        selectedOperationItems.value = [item];
        objectAssignDialogVisible.value = true;
      }
    }
  ];
});

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
  if (!canManageUnitContent.value) return;

  selectedOperationItems.value = selectedItems.value;
  showDeleteDialog.value = true;
};

const onBulkAssign = () => {
  if (!canManageUnitContent.value) return;

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

const hasCSVImport = ref(false);
</script>

<i18n src="~/locales/base/pages/unit-domains-domain-object-type-sub-type-index.json"></i18n>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  flex-wrap: wrap;
}

.toolbar-search {
  flex: 1;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.actions-wrapper {
  display: flex;
  align-items: center;
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

.drag-active {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}
</style>

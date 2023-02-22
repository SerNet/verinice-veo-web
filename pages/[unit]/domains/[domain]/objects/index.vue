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
  <BasePage
    :title="upperFirst(t('objectOverview').toString())"
    data-component-name="object-overview-page"
    sticky-footer
  >
    <template #default>
      <ObjectCreateDialog
        v-if="objectType"
        v-model="createDialogVisible"
        :domain-id="domainId"
        :object-type="objectType"
        :sub-type="subType"
      />
      <ObjectDeleteDialog
        :model-value="!!itemDelete"
        :item="itemDelete"
        @update:model-value="onCloseDeleteDialog"
        @success="onCloseDeleteDialog(false)"
        @error="showError('delete', itemDelete, $event)"
      />
      <ObjectFilterBar
        ref="filterBar"
        :domain-id="domainId"
        :filter="filter"
        :required-fields="['objectType']"
        @update:filter="updateRouteQuery"
      />
      <BaseCard v-if="objectType">
        <ObjectTable
          v-model:page="page"
          v-model:sort-by="sortBy"
          :items="items"
          :loading="isLoading"
          :default-headers="['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt', 'actions']"
          :additional-headers="additionalHeaders"
          data-component-name="object-overview-table"
          enable-click
          @click="openItem"
        >
          <template #actions="{item}">
            <div class="d-flex">
              <v-tooltip
                v-for="btn in actions"
                :key="btn.id"
                location="start"
              >
                <template #activator="{ props }">
                  <v-btn
                    :data-component-name="`object-overview-${btn.id}-button`"
                    :disabled="ability.cannot('manage', 'objects')"
                    v-bind="props"
                    :icon="btn.icon"
                    variant="text"
                    @click="btn.action(item)"
                  />
                </template>
                {{ btn.label }}
              </v-tooltip>
            </div>
          </template>
        </ObjectTable>
      </BaseCard>
      <ObjectTypeError v-else>
        <v-btn
          color="primary"
          text
          @click="onOpenFilterDialog"
        >
          {{ t('filterObjects') }}
        </v-btn>
      </ObjectTypeError>
    </template>
    <template #footer>
      <v-tooltip
        v-if="objectType"
        location="start"
      >
        <template
          #activator="{ props }"
        >
          <v-btn
            color="primary"
            flat
            :disabled="ability.cannot('manage', 'objects')"
            :icon="mdiPlus"
            class="veo-primary-action-fab"
            data-component-name="create-object-button"
            v-bind="props"
            size="large"
            @click="createDialogVisible = true"
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
import { RouteRecordName } from 'vue-router';
import { mdiContentCopy, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { omit, upperFirst } from 'lodash';
import { useVeoBreadcrumbs } from '~/composables/VeoBreadcrumbs';

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { IVeoEntity, IVeoFormSchemaMeta } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useCloneObject } from '~/composables/VeoObjectUtilities';
import { ObjectTableHeader } from '~/components/object/Table.vue';
import { useFetchObjects } from '~/composables/api/objects';
import { useFetchForms } from '~/composables/api/forms';
import { useVeoUser } from '~/composables/VeoUser';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useFetchTranslations } from '~/composables/api/translations';
import { useFetchSchemas } from '~/composables/api/schemas';

export const ROUTE_NAME = 'unit-domains-domain-objects';

export default defineComponent({
  name: 'VeoObjectsOverviewPage',
  setup() {
    const { t, locale } = useI18n();
    const { t: $t } = useI18n({ useScope: 'global' });
    const { tablePageSize } = useVeoUser();
    const route = useRoute();
    const router = useRouter();
    const { ability } = useVeoPermissions();

    const { displayErrorMessage } = useVeoAlerts();
    const { clone } = useCloneObject();
    const { customBreadcrumbExists, addCustomBreadcrumb, removeCustomBreadcrumb } = useVeoBreadcrumbs();
    const { data: endpoints } = useFetchSchemas();

    const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations, isFetching: translationsLoading } = useFetchTranslations(fetchTranslationsQueryParameters);

    const itemDelete = ref<IVeoEntity>();

    const createDialogVisible = ref(false);

    // Ref to filter bar to programmatically open filter dialog from outside
    const filterBar = ref();
    const onOpenFilterDialog = () => {
      filterBar.value.filterDialogVisible = true;
    };

    // accepted filter keys (others wont be respected when specified in URL query parameters)
    const filterKeys = ['objectType', 'subType', 'designator', 'name', 'status', 'description', 'updatedBy', 'notPartOfGroup', 'hasChildObjects'] as const;
    type FilterKey = typeof filterKeys[number];

    // filter built from URL query parameters
    const filter = computed(() => {
      const query = route.query;
      return Object.fromEntries(
        filterKeys.map((key) => {
          // Extract first query value
          const val = ([] as (string | null)[]).concat(query[key]).shift();
          return [key, val === null ? true : val];
        })
      ) as Record<FilterKey, string | undefined>;
    });

    // current object type and sub type
    const objectType = computed(() => filter.value.objectType);
    const subType = computed(() => filter.value.subType);

    // parse UUID from URL
    const domainId = computed(() => separateUUIDParam(route.params.domain as string).id);

    // fetch objects of objectType
    const page = ref(1);
    const sortBy = ref([{ key: 'name', order: 'desc' }]);
    const resetQueryOptions = () => {
      page.value = 1;
      sortBy.value = [{ key: 'name', order: 'desc' }];
    };

    const endpoint = computed(() => endpoints.value?.[filter.value.objectType || '']);
    const combinedQueryParameters = computed<any>(() => ({
      size: tablePageSize.value,
      sortBy: sortBy.value[0].key,
      sortOrder: sortBy.value[0].order,
      page: page.value,
      unit: separateUUIDParam(route.params.unit as string).id,
      ...omit(filter.value, 'objectType'),
      endpoint: endpoint.value
    }));
    const queryEnabled = computed(() => !!objectType.value && !!endpoint.value);
    const { data: items, isLoading: isLoadingObjects } = useFetchObjects(combinedQueryParameters, { enabled: queryEnabled, keepPreviousData: true, placeholderData: [] });

    const formsQueryParameters = computed(() => ({ domainId: domainId.value }));
    const formsQueryEnabled = computed(() => !!domainId.value);
    const { data: formSchemas } = useFetchForms(formsQueryParameters, { enabled: formsQueryEnabled, placeholderData: [] });

    const isLoading = computed(() => isLoadingObjects.value || translationsLoading.value);

    watch(() => filter.value, resetQueryOptions, { deep: true });

    // Additional breadcrumbs based on object type and sub type
    const objectTypeKey = 'object-overview-object-type';

    const onObjectTypeChanged = (newObjectType?: string) => {
      if (customBreadcrumbExists(objectTypeKey)) {
        removeCustomBreadcrumb(objectTypeKey);
      }

      // Exit if no subtype is set
      if (!newObjectType) {
        return;
      }

      addCustomBreadcrumb({
        key: objectTypeKey,
        text: translations.value?.lang[locale.value]?.[endpoints.value?.[newObjectType] || newObjectType],
        to: `/${route.params.unit}/domains/${route.params.domain}/objects?objectType=${newObjectType}`,
        param: objectTypeKey,
        index: 0,
        position: 11
      });
    };
    watch(() => objectType.value, onObjectTypeChanged, { immediate: true });
    watch(
      () => translations.value,
      () => onObjectTypeChanged(objectType.value),
      { deep: true }
    );
    watch(
      () => endpoints.value,
      () => onObjectTypeChanged(objectType.value),
      { deep: true }
    );

    const subTypeKey = 'object-overview-sub-type';

    const onSubTypeChanged = (newSubType?: string) => {
      if (customBreadcrumbExists(subTypeKey)) {
        removeCustomBreadcrumb(subTypeKey);
      }

      // Exit if no subtype is set
      if (!newSubType) {
        return;
      }

      const formSchema = (formSchemas.value as IVeoFormSchemaMeta[]).find((formSchema) => formSchema.subType === newSubType);

      addCustomBreadcrumb({
        key: subTypeKey,
        text: formSchema ? formSchema.name[locale.value] || Object.values(formSchema.name[locale.value])[0] : newSubType,
        to: `/${route.params.unit}/domains/${route.params.domain}/objects?objectType=${objectType.value}&subType=${newSubType}`,
        param: objectTypeKey,
        index: 0,
        position: 12
      });
    };
    watch(() => subType.value, onSubTypeChanged, { immediate: true });
    watch(
      () => formSchemas.value,
      () => onSubTypeChanged(subType.value),
      { deep: true }
    );

    onUnmounted(() => {
      removeCustomBreadcrumb(objectTypeKey);
      removeCustomBreadcrumb(subTypeKey);
    });

    // Update query parameters but keep other route options
    const updateRouteQuery = async (v: Record<string, string | undefined | null | true>, reset = true) => {
      const resetValues = reset ? filterKeys.map((key) => [key, undefined as string | undefined | null]) : [];
      const newValues = Object.fromEntries(resetValues.concat(Object.entries(v).map(([k, v]) => [k, v === true ? null : v])));
      const query = { ...route.query, ...newValues };
      // obsolete params need to be removed from the query to match the route exactly in the NavigationDrawer
      Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);
      await router.push({ ...route, name: route.name as RouteRecordName | undefined, query });
    };

    const formatValue = (label: FilterKey, value?: string) => {
      switch (label) {
        // Uppercase object types
        case 'objectType':
          return value ? translations.value?.lang[locale.value]?.[value] : undefined;
        // Translate sub types
        case 'subType':
          return (formSchemas.value as IVeoFormSchemaMeta[]).find((formschema) => formschema.subType === value)?.name?.[locale.value] || value;
        case 'status':
          return translations.value?.lang?.[locale.value]?.[`${objectType.value}_${subType.value}_status_${value}`] || value;
        default:
          return value;
      }
    };

    const createObjectLabel = computed(() => (subType.value ? formatValue('subType', subType.value) : formatValue('objectType', objectType.value)));

    const onCloseDeleteDialog = (visible: boolean) => {
      if (visible === false) {
        itemDelete.value = undefined;
      }
    };

    const showError = (messageKey: 'clone' | 'delete', _item: IVeoEntity | undefined, error: Error) => {
      displayErrorMessage(t(`errors.${messageKey}`).toString(), error?.toString());
    };

    const openItem = ({ item }: { item: any }) => {
      return router.push({
        name: 'unit-domains-domain-objects-object',
        params: {
          ...route.params,
          object: createUUIDUrlParam(item.raw.type, item.raw.id)
        },
        query: {
          subType: subType.value
        }
      });
    };

    const actions = computed(() => [
      {
        id: 'clone',
        label: upperFirst(t('cloneObject').toString()),
        icon: mdiContentCopy,
        async action(item: any) {
          try {
            await clone(item.raw);
          } catch (e: any) {
            showError('clone', item.raw, e);
          }
        }
      },
      {
        id: 'delete',
        label: upperFirst(t('deleteObject').toString()),
        icon: mdiTrashCanOutline,
        action(item: any) {
          itemDelete.value = item.raw;
        }
      }
    ]);

    // Additional headers (only if user is viewing processes with subtype PRO_DataProcessing)
    const additionalHeaders = computed<ObjectTableHeader[]>(() =>
      filter.value.objectType === 'process' && filter.value.subType === 'PRO_DataProcessing'
        ? [
          {
            priority: 31,
            order: 51,
            value: `domains.${domainId.value}.decisionResults.piaMandatory.value`,
            render: ({ item }) =>
              h('div', item.domains[domainId.value]?.decisionResults?.piaMandatory?.value ? $t('global.button.yes').toString() : t('global.button.no').toString()),
            text: t('dpiaMandatory').toString(),
            sortable: false,
            width: 210
          }
        ]
        : []
    );

    return {
      t,
      ability,
      actions,
      additionalHeaders,
      domainId,
      createObjectLabel,
      filter,
      createDialogVisible,
      filterBar,
      isLoading,
      itemDelete,
      items,
      mdiPlus,
      objectType,
      openItem,
      onCloseDeleteDialog,
      onOpenFilterDialog,
      page,
      showError,
      sortBy,
      subType,
      updateRouteQuery,
      upperFirst
    };
  }
});
</script>

<i18n>
{
  "en": {
    "objectOverview": "object overview",
    "filterObjects": "filter objects",
    "createObject": "create {0}",
    "clone": "duplicated",
    "cloneObject": "clone object",
    "deleteObject": "delete object",
    "dpiaMandatory": "Privacy impact assessment required",
    "errors": {
      "clone": "Could not clone object",
      "delete": "Could not delete object"
    }
  },
  "de": {
    "objectOverview": "Objektübersicht",
    "filterObjects": "Objekte filtern",
    "createObject": "{0} erstellen",
    "clone": "dupliziert",
    "cloneObject": "objekt duplizieren",
    "deleteObject": "objekt löschen",
    "dpiaMandatory": "DSFA verpflichtend",
    "errors": {
      "clone": "Das Objekt konnte nicht dupliziert werden",
      "delete": "Das Objekt konnte nicht gelöscht werden"
    }
  }
}
</i18n>

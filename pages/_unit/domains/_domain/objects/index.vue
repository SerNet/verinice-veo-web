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
  <VeoPage
    :title="upperFirst(t('objectOverview').toString())"
    data-component-name="object-overview-page"
    sticky-footer
  >
    <template #default>
      <VeoCreateObjectDialog
        v-if="objectType"
        v-model="createDialogVisible"
        :domain-id="domainId"
        :object-type="objectType"
        :sub-type="subType"
        @success="refetch"
      />
      <VeoDeleteEntityDialog
        :value="!!itemDelete"
        :item="itemDelete"
        @input="onCloseDeleteDialog"
        @success="refetch(); onCloseDeleteDialog(false)"
        @error="showError('delete', itemDelete, $event)"
      />
      <VeoObjectFilterBar
        ref="filterBar"
        :domain-id="domainId"
        :filter="filter"
        :required-fields="['objectType']"
        @update:filter="updateRouteQuery"
      />
      <VeoCard v-if="objectType">
        <VeoObjectTable
          :items="items"
          :loading="isLoading"
          :default-headers="['icon', 'designator', 'abbreviation', 'name', 'status', 'description', 'updatedBy', 'updatedAt', 'actions']"
          :additional-headers="additionalHeaders"
          :page="queryParameters.page"
          data-component-name="object-overview-table"
          @page-change="onPageChange"
          @click="openItem"
        >
          <template #actions="{item}">
            <v-tooltip
              v-for="btn in actions"
              :key="btn.id"
              bottom
            >
              <template #activator="{on}">
                <v-btn
                  icon
                  :data-component-name="`object-overview-${btn.id}-button`"
                  :disabled="ability.cannot('manage', 'objects')"
                  @click="btn.action(item)"
                  v-on="on"
                >
                  <v-icon v-text="btn.icon" />
                </v-btn>
              </template>
              {{ btn.label }}
            </v-tooltip>
          </template>
        </VeoObjectTable>
      </VeoCard>
      <VeoObjectTypeError v-else>
        <v-btn
          color="primary"
          text
          @click="onOpenFilterDialog"
        >
          {{ t('filterObjects') }}
        </v-btn>
      </VeoObjectTypeError>
    </template>
    <template #footer>
      <v-tooltip
        v-if="objectType"
        left
      >
        <template
          #activator="{ on }"
        >
          <v-btn
            v-cy-name="'create-button'"
            color="primary"
            depressed
            :disabled="ability.cannot('manage', 'objects')"
            fab
            absolute
            style="bottom: 12px; right: 0"
            data-component-name="create-object-button"
            @click="createDialogVisible = true"
            v-on="on"
          >
            <v-icon>
              {{ mdiPlus }}
            </v-icon>
          </v-btn>
          <div style="height: 76px" />
        </template>
        <template #default>
          <span>{{ t('createObject', [createObjectLabel]) }}</span>
        </template>
      </v-tooltip>
    </template>
  </VeoPage>
</template>

<script lang="ts">
import { mdiContentCopy, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import { useI18n } from 'nuxt-i18n-composable';
import { computed, defineComponent, h, useRoute, useRouter, ref, reactive, watch, onUnmounted } from '@nuxtjs/composition-api';
import { upperFirst } from 'lodash';
import { useVeoBreadcrumbs } from '~/composables/VeoBreadcrumbs';

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { IVeoEntity, IVeoFormSchemaMeta } from '~/types/VeoTypes';
import { useVeoAlerts } from '~/composables/VeoAlert';
import { useVeoObjectUtilities } from '~/composables/VeoObjectUtilities';
import { ObjectTableHeader } from '~/components/objects/VeoObjectTable.vue';
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
    const { tablePageSize } = useVeoUser();
    const route = useRoute();
    const router = useRouter();
    const { ability } = useVeoPermissions();

    const { displayErrorMessage } = useVeoAlerts();
    const { cloneObject } = useVeoObjectUtilities();
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
      const query = route.value.query;
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
    const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

    // fetch objects of objectType
    const queryParameters = reactive({ page: 1, sortBy: 'name', sortDesc: false });
    const resetQueryOptions = () => {
      Object.assign(queryParameters, { page: 1, sortBy: 'name', sortDesc: false });
    };

    const combinedQueryParameters = computed<any>(() => ({
      size: tablePageSize.value,
      sortBy: queryParameters.sortBy,
      sortOrder: queryParameters.sortDesc ? 'desc' : 'asc',
      page: queryParameters.page,
      unit: separateUUIDParam(route.value.params.unit).id,
      ...filter.value,
      endpoint: objectType.value && endpoints.value ? endpoints.value[objectType.value] : undefined
    }));
    const queryEnabled = computed(() => !!objectType.value && !!endpoints.value?.[objectType.value]);

    const { data: items, isLoading: isLoadingObjects, refetch } = useFetchObjects(combinedQueryParameters, { enabled: queryEnabled, keepPreviousData: true, placeholderData: [] });

    const formsQueryParameters = computed(() => ({ domainId: domainId.value }));
    const formsQueryEnabled = computed(() => !!domainId.value);
    const { data: formSchemas } = useFetchForms(formsQueryParameters, { enabled: formsQueryEnabled, placeholderData: [] });

    const isLoading = computed(() => isLoadingObjects.value || translationsLoading.value);

    watch(() => filter.value, resetQueryOptions, { deep: true });

    // refetch entities on page or sort changes (in VeoObjectTable)
    const onPageChange = (opts: { newPage: number; sortBy: string; sortDesc?: boolean }) => {
      Object.assign(queryParameters, { page: opts.newPage, sortBy: opts.sortBy, sortDesc: !!opts.sortDesc });
    };

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
        to: `/${route.value.params.unit}/domains/${route.value.params.domain}/objects?objectType=${newObjectType}`,
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
        to: `/${route.value.params.unit}/domains/${route.value.params.domain}/objects?objectType=${objectType.value}&subType=${newSubType}`,
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
      const query = { ...route.value.query, ...newValues };
      // obsolete params need to be removed from the query to match the route exactly in the NavigationDrawer
      Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);
      await router.push({ ...route.value, name: route.value.name!, query });
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

    const openItem = ({ item }: { item: IVeoEntity }) => {
      return router.push({
        name: 'unit-domains-domain-objects-entity',
        params: {
          ...route.value.params,
          entity: createUUIDUrlParam(item.type, item.id)
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
        async action(item: IVeoEntity) {
          try {
            await cloneObject(endpoints.value || {}, item);
            refetch();
          } catch (e: any) {
            showError('clone', item, e);
          }
        }
      },
      {
        id: 'delete',
        label: upperFirst(t('deleteObject').toString()),
        icon: mdiTrashCanOutline,
        action(item: IVeoEntity) {
          itemDelete.value = item;
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
                h('div', item.domains[domainId.value]?.decisionResults?.piaMandatory?.value ? t('global.button.yes').toString() : t('global.button.no').toString()),
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
      onPageChange,
      refetch,
      showError,
      subType,
      updateRouteQuery,
      queryParameters,
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

<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Tino Groteloh, Philipp Ballhausen, Annemarie Bufe, jae
   - Samuel Vitzthum
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
  <v-navigation-drawer
    :width="300"
    :model-value="modelValue"
    :rail="!xs && miniVariant"
    :permanent="!xs"
    :temporary="xs"
    scrim
    v-bind="$attrs"
  >
    <template #prepend>
      <div class="my-6">
        <NavigationUnitSelect :mini-variant="miniVariant" @expand-menu="miniVariant = false" />
        <!-- @vue-ignore TODO #3066 $route does not exist -->
        <NavigationDomainSelect
          :disabled="!$route.params.unit"
          :mini-variant="miniVariant"
          @expand-menu="miniVariant = false"
        />
      </div>
    </template>
    <template #default>
      <v-list ref="primaryNavList" class="mt-4" :rounded="miniVariant" role="menu">
        <template v-for="item in items" :key="item.id">
          <NavigationPrimaryNavigationCategory
            v-if="item.children"
            v-bind="item"
            :level="0"
            :mini-variant="miniVariant"
            @expand-menu="miniVariant = false"
          />
          <NavigationPrimaryNavigationEntry
            v-else
            v-bind="item"
            :level="0"
            :mini-variant="miniVariant"
            @expand-menu="miniVariant = false"
          />
        </template>
      </v-list>
    </template>
    <template #append>
      <v-divider style="background: rgba(255, 255, 255, 0.2)" />
      <v-list density="compact" class="pa-0" role="menu">
        <v-list-item
          v-if="!xs"
          class="pl-4"
          data-component-name="toggle-navigation"
          density="compact"
          tabindex="0"
          autofocus
          role="menuitem"
          @click="miniVariant = !miniVariant"
        >
          <template #prepend>
            <v-icon v-if="miniVariant" :color="chevronColor" class="mr-3" :icon="mdiChevronRight" />
            <v-icon v-else :color="chevronColor" class="mr-3" :icon="mdiChevronLeft" />
          </template>
          <v-list-item-title v-if="miniVariant">
            {{ t('fix') }}
          </v-list-item-title>
          <v-list-item-title v-else>
            {{ t('collapse') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import type { RouteLocationRaw } from 'vue-router';

export interface INavItem {
  id: string;
  name: string;
  icon?: string;
  exact?: boolean;
  to?: RouteLocationRaw;
  children?: INavItem[];
  childrenLoading?: boolean;
  componentName?: string;
  classes?: string;
  openInNewtab?: boolean;
}

export const PROVIDE_KEYS = {
  navigation: 'primaryNavigationList'
};
</script>

<script setup lang="ts">
import {
  mdiBookOpenPageVariantOutline,
  mdiChartBar,
  mdiChevronLeft,
  mdiChevronRight,
  mdiFileChartOutline,
  mdiTextBoxEditOutline,
  mdiUngroup,
  mdiViewDashboardOutline
} from '@mdi/js';
import { sortBy, upperFirst, isEmpty } from 'lodash';
import { StorageSerializers, useStorage } from '@vueuse/core';
import { useDisplay, useTheme } from 'vuetify';

import { extractSubTypesFromObjectSchema, OBJECT_TYPE_SORT_ORDER } from '~/lib/utils';
import { VeoElementTypePlurals } from '~/types/VeoTypes';
import type { IVeoDomainSpecificObjectSchema } from '~/types/VeoTypes';
import { ROUTE_NAME as DOMAIN_DASHBOARD_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/index.vue';
import { ROUTE_NAME as OBJECT_OVERVIEW_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/index.vue';
import { ROUTE_NAME as CATALOGS_CATALOG_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/catalog/index.vue';
import { ROUTE_NAME as REPORTS_REPORT_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/reports/[report].vue';
import { ROUTE_NAME as RISKS_MATRIX_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/risks/[definition]/index.vue';
import { ROUTE_NAME as EDITOR_INDEX_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/editor/index.vue';
import { OBJECT_TYPE_ICONS } from '~/components/object/Icon.vue';
import { CATALOG_TYPE_ICONS } from '~/components/catalog/Icon.vue';
import { useVeoUser } from '~/composables/VeoUser';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useFetchSchemasDetailed } from '~/composables/api/schemas';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import catalogQueryDefinitions from '~/composables/api/queryDefinitions/catalogs';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import reportQueryDefinitions from '~/composables/api/queryDefinitions/reports';
import translationQueryDefinitions from '~/composables/api/queryDefinitions/translations';
import { useQuery } from '~/composables/api/utils/query';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    unitId?: string;
    domainId?: string;
  }>(),
  {
    modelValue: true,
    unitId: undefined,
    domainId: undefined
  }
);

const { t, locale } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const { authenticated } = useVeoUser();
const { ability } = useVeoPermissions();
const { xs } = useDisplay();
const theme = useTheme();

// Layout stuff
const miniVariant = useStorage(LOCAL_STORAGE_KEYS.PRIMARY_NAV_MINI_VARIANT, false, localStorage, {
  serializer: StorageSerializers.boolean
});

const fetchTranslationsQueryParameters = computed(() => ({
  languages: [locale.value],
  domain: props.domainId as string
}));
const fetchTranslationsQueryEnabled = computed(() => authenticated.value && !!props.domainId);
const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, fetchTranslationsQueryParameters, {
  enabled: fetchTranslationsQueryEnabled
});

// objects specific stuff
const objectSchemas = ref<IVeoDomainSpecificObjectSchema[]>([]);
const schemasLoading = ref(false);

const fetchSchemasDetailedQueryParameters = computed(() => ({
  domainId: props.domainId as string
}));
const fetchSchemasDetailedQueryEnabled = computed(() => !!props.domainId && authenticated.value);
const _schemas = useFetchSchemasDetailed(fetchSchemasDetailedQueryParameters, {
  enabled: fetchSchemasDetailedQueryEnabled
});
watch(
  () => _schemas,
  (newValue) => {
    objectSchemas.value = (newValue || []).map((schema) => schema.data).filter((schema) => schema);
    schemasLoading.value = (newValue || []).some((schema) => schema.isFetching);
  },
  { deep: true }
);

const objectTypesChildItems = computed<INavItem[]>(() =>
  objectSchemas.value
    .map((objectSchema) => ({ modelType: objectSchema.title, subTypes: extractSubTypesFromObjectSchema(objectSchema) }))
    .filter(({ subTypes }) => subTypes.length !== 0)
    .sort(
      ({ modelType: aModelType }, { modelType: bModelType }) =>
        OBJECT_TYPE_SORT_ORDER.indexOf(aModelType) - OBJECT_TYPE_SORT_ORDER.indexOf(bModelType)
    )
    .map(({ modelType, subTypes }) => {
      const _icon = OBJECT_TYPE_ICONS.get(modelType);

      return {
        id: modelType,
        name: upperFirst(translations.value?.lang[locale.value]?.[`${modelType}_plural`] || modelType),
        icon: _icon?.library === 'mdi' ? (_icon?.icon as string) : undefined,
        children: [
          // all of object type
          {
            id: `${modelType}_all`,
            name: upperFirst(t('all').toString()),
            to: {
              name: OBJECT_OVERVIEW_ROUTE_NAME,
              params: {
                unit: props.unitId,
                domain: props.domainId,
                objectType: VeoElementTypePlurals[modelType],
                subType: '-'
              }
            }
          },

          // dynamic sub type routes
          ...sortBy(
            subTypes.map(({ subType: subType }) => {
              const displayName =
                domain.value ?
                  domain.value.elementTypeDefinitions[modelType].translations[locale.value][
                    `${modelType}_${subType}_plural`
                  ]
                : subType;

              return {
                id: displayName,
                name: displayName,
                to: {
                  name: OBJECT_OVERVIEW_ROUTE_NAME,
                  params: {
                    unit: props.unitId,
                    domain: props.domainId,
                    objectType: VeoElementTypePlurals[modelType],
                    subType: subType
                  }
                },
                sorting: domain.value ? domain.value.elementTypeDefinitions[modelType].subTypes[subType].sortKey : 0
              };
            }),
            'sorting'
          )
        ]
      };
    })
);

// catalog specific stuff
const typeCountQueryParameters = computed(() => ({
  domainId: props.domainId as string
}));
const typeCountQueryEnabled = computed(() => !!props.domainId);
const { data: catalogItemTypes, isFetching: catalogItemTypeCountIsLoading } = useQuery(
  catalogQueryDefinitions.queries.fetchCatalogItemTypeCount,
  typeCountQueryParameters,
  { enabled: typeCountQueryEnabled }
);

// @ts-ignore TODO #3066 no overload matches
const catalogsEntriesChildItems = computed<INavItem[]>(() => {
  if (isEmpty(catalogItemTypes?.value || {})) return [];

  const catalogItems = [
    ['all', { all: 'MISC' }],
    ...Object.entries(catalogItemTypes?.value || []).sort(
      (a, b) => OBJECT_TYPE_SORT_ORDER.indexOf(a[0]) - OBJECT_TYPE_SORT_ORDER.indexOf(b[0])
    )
  ];

  const catalogNavItems = (catalogItems || []).map((catalogItem) => {
    const modelType = catalogItem[0] as string;
    const _icon = CATALOG_TYPE_ICONS.get(modelType);
    const subTypeDefinitions =
      modelType === 'all' || !domain.value ? {} : domain.value.elementTypeDefinitions[modelType].subTypes;
    const _subTypes = Object.keys(catalogItem[1] || {}).sort(
      (a, b) => (subTypeDefinitions?.[a]?.sortKey || 0) - (subTypeDefinitions?.[b]?.sortKey || 0)
    );

    return _subTypes.map((_subType) => {
      const displayName =
        _subType === 'all' ?
          t('all')
        : (domain.value ?
            domain.value.elementTypeDefinitions[modelType].translations[locale.value][`${modelType}_${_subType}_plural`]
          : null) || _subType;

      const item = {
        id: `${catalogItem[0]}`,
        name: displayName,
        subtype: _subType,
        elementType: catalogItem[0],
        componentName: `catalog-child-${modelType}`,
        icon: _icon?.library === 'mdi' ? (_icon?.icon as string) : undefined,
        to: {
          name: CATALOGS_CATALOG_ROUTE_NAME,
          params: {
            unit: props.unitId,
            domain: props.domainId
          },
          query: {
            type: modelType,
            subType: _subType
          }
        }
      };
      return item;
    });
  });
  return catalogNavItems.flat();
});

const fetchDomainQueryParameters = computed(() => ({
  id: props.domainId as string
}));
const fetchDomainQueryEnabled = computed(() => !!props.domainId);
const { data: domain, isFetching: riskDefinitionsLoading } = useQuery(
  domainQueryDefinitions.queries.fetchDomain,
  fetchDomainQueryParameters,
  { enabled: fetchDomainQueryEnabled }
);

// report specific stuff

const fetchReportsQueryParameters = computed(() => ({
  domain: domain.value?.name as string
}));

const fetchReportsQueryEnabled = computed(() => !!domain.value);

const { data: reports, isFetching: reportsEntriesLoading } = useQuery(
  reportQueryDefinitions.queries.fetchAll,
  fetchReportsQueryParameters,
  { enabled: fetchReportsQueryEnabled }
);

const reportsEntriesChildItems = computed<INavItem[]>(() =>
  sortBy(
    Object.entries(reports.value || {})
      .map(([reportId, report]) => ({
        id: reportId,
        name: report.name[locale.value],
        exact: true,
        to: {
          name: REPORTS_REPORT_ROUTE_NAME,
          params: {
            unit: props.unitId,
            domain: props.domainId,
            report: reportId
          }
        }
      }))
      .filter((entry) => entry.name), // Don't show reports which aren't translated in the users language);
    'name'
  )
);

// risk specific stuff
const riskDefinitions = computed(() => domain.value?.riskDefinitions || {});

const riskChildItems = computed<INavItem[]>(() =>
  Object.values(riskDefinitions.value).map(({ id }: { id: string }) => ({
    id: id,
    name: id,
    componentName: `risk-definition-${id}`,
    to: {
      name: RISKS_MATRIX_ROUTE_NAME,
      params: {
        unit: props.unitId,
        domain: props.domainId,
        definition: id
      }
    }
  }))
);

const domainDashboardNavEntry = computed<INavItem>(() => ({
  id: 'domainDashboard',
  name: $t('domain.index.title').toString(),
  icon: mdiViewDashboardOutline,
  to: {
    name: DOMAIN_DASHBOARD_ROUTE_NAME,
    params: {
      unit: props.unitId,
      domain: props.domainId
    }
  },
  componentName: 'domain-dashboard-nav-item',
  exact: true
}));

const objectsNavEntry = computed<INavItem>(() => ({
  id: 'objects',
  name: $t('breadcrumbs.objects').toString(),
  icon: mdiUngroup,
  children: objectTypesChildItems.value,
  childrenLoading: schemasLoading.value,
  componentName: 'objects-nav-item'
}));

const catalogsNavEntry = computed<INavItem>(() => ({
  id: 'catalog',
  name: $t('breadcrumbs.catalog').toString(),
  icon: mdiBookOpenPageVariantOutline,
  children: catalogsEntriesChildItems.value,
  childrenLoading: catalogItemTypeCountIsLoading.value,
  componentName: 'catalogs-nav-item'
}));

const reportsNavEntry = computed<INavItem>(() => ({
  id: 'reports',
  name: $t('breadcrumbs.reports').toString(),
  icon: mdiFileChartOutline,
  children: reportsEntriesChildItems.value,
  childrenLoading: riskDefinitionsLoading.value || reportsEntriesLoading.value,
  componentName: 'reports-nav-item'
}));

const risksNavEntry = computed<INavItem>(() => ({
  id: 'risks',
  name: $t('breadcrumbs.risks').toString(),
  icon: mdiChartBar,
  children: riskChildItems.value,
  childrenLoading: riskDefinitionsLoading.value,
  componentName: 'risks-nav-item'
}));

const editorsNavEntry = computed<INavItem>(() => ({
  id: 'editors',
  name: $t('breadcrumbs.editor').toString(),
  icon: mdiTextBoxEditOutline,
  to: {
    name: EDITOR_INDEX_ROUTE_NAME,
    params: {
      unit: props.unitId,
      domain: props.domainId
    }
  },
  classes: 'mb-4'
}));

const items = computed<INavItem[]>(() => [
  ...(props.unitId && props.domainId ?
    [
      domainDashboardNavEntry.value,
      ...(props.domainId && props.unitId && ability.value.can('view', 'editors') ? [editorsNavEntry.value] : []),
      objectsNavEntry.value,
      ...(!isEmpty(catalogsEntriesChildItems.value) ? [catalogsNavEntry.value] : []),
      ...(!isEmpty(reportsEntriesChildItems.value) ? [reportsNavEntry.value] : []),
      ...(!isEmpty(riskChildItems.value) ? [risksNavEntry.value] : [])
    ]
  : [])
]);

// Provide the ref to the v-list so children can do stuff with it
const primaryNavList = ref();
provide(PROVIDE_KEYS.navigation, primaryNavList);

// adjust icon color <mdiChevron> according to the mode chosen
const chevronColor = computed(() => (theme.global.name.value === 'light' ? 'black' : 'white'));
</script>

<i18n src="~/locales/base/components/navigation-primary-navigation.json"></i18n>

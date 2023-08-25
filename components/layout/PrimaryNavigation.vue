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
    class="veo-primary-navigation"
    v-bind="$attrs"
  >
    <template #prepend>
      <DomainSelect
        v-if="route.params.unit"
        :mini-variant="miniVariant"
        @expand-menu="miniVariant = false"
      />
    </template>
    <template #default>
      <v-list
        ref="primaryNavList"
        class="mt-4"
        :rounded="miniVariant"
      >
        <template
          v-for="item in items"
          :key="item.id"
        >
          <LayoutPrimaryNavigationCategory
            v-if="item.children"
            v-bind="item"
            :level="0"
            :mini-variant="miniVariant"
            @expand-menu="miniVariant = false"
          />
          <LayoutPrimaryNavigationEntry
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
      <v-list
        density="compact"
        class="pa-0"
      >
        <v-divider style="background: rgba(255, 255, 255, 0.2)" />
        <v-list-item
          v-if="!xs"
          class="pl-4"
          data-component-name="toggle-navigation"
          density="compact"
          @click="miniVariant = !miniVariant"
        >
          <template #prepend>
            <v-icon
              v-if="miniVariant"
              color="black"
              class="mr-3"
              :icon="mdiChevronRight"
            />
            <v-icon
              v-else
              color="black"
              class="mr-3"
              :icon="mdiChevronLeft"
            />
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
import { RouteLocationRaw } from 'vue-router';
import {
  mdiBookOpenPageVariantOutline,
  mdiChartBar,
  mdiChevronLeft,
  mdiChevronRight,
  mdiFileChartOutline,
  mdiFileDocumentOutline,
  mdiHomeOutline,
  mdiShapeOutline,
  mdiTextBoxEditOutline,
  mdiUngroup,
  mdiViewDashboardOutline
} from '@mdi/js';
import { sortBy, upperFirst, isEmpty } from 'lodash';
import { StorageSerializers, useStorage } from '@vueuse/core';
import { useDisplay } from 'vuetify';
import { NavItem } from '@nuxt/content/dist/runtime/types';

import { extractSubTypesFromObjectSchema } from '~/lib/utils';
import { IVeoObjectSchema } from '~/types/VeoTypes';
import { IVeoFormSchema } from '~~/composables/api/queryDefinitions/forms';
import { ROUTE_NAME as UNIT_SELECTION_ROUTE_NAME } from '~/pages/index.vue';
import { ROUTE_NAME as DOMAIN_DASHBOARD_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/index.vue';
import { ROUTE_NAME as OBJECT_OVERVIEW_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/index.vue';
import { ROUTE_NAME as CATALOGS_CATALOG_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/catalogs/[catalog].vue';
import { ROUTE_NAME as REPORTS_REPORT_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/reports/[report].vue';
import { ROUTE_NAME as RISKS_MATRIX_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/risks/[matrix].vue';
import { ROUTE_NAME as EDITOR_INDEX_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/editor/index.vue';
import { ROUTE_NAME as PROFILE_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/profiles.vue';
import { OBJECT_TYPE_ICONS } from '~/components/object/Icon.vue';
import { CATALOG_TYPE_ICONS } from '~/components/catalog/Icon.vue';
import { useVeoUser } from '~/composables/VeoUser';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useFetchSchemasDetailed } from '~/composables/api/schemas';
import { useDocNavigation } from '~/composables/docs';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import catalogQueryDefinitions from '~~/composables/api/queryDefinitions/catalogs';
import domainQueryDefinitions from '~~/composables/api/queryDefinitions/domains';
import formsQueryDefinitions from '~~/composables/api/queryDefinitions/forms';
import reportQueryDefinitions from '~~/composables/api/queryDefinitions/reports';
import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import translationQueryDefinitions from '~~/composables/api/queryDefinitions/translations';
import { useQuery } from '~~/composables/api/utils/query';

const objectTypeSortOrder = new Map<string, number>([
  ['scope', 1],
  ['process', 2],
  ['asset', 3],
  ['person', 4],
  ['incident', 5],
  ['document', 6],
  ['scenario', 7],
  ['control', 8]
]);

const props = withDefaults(defineProps<{
  modelValue: boolean;
  unitId?: string;
  domainId?: string;
}>(), {
  modelValue: true,
  unitId: undefined,
  domainId: undefined
});

const { t, locale } = useI18n();
const { t: $t } = useI18n({ useScope: 'global' });
const { authenticated, userSettings } = useVeoUser();
const route = useRoute();
const { ability } = useVeoPermissions();
const { xs } = useDisplay();

// Helpers
/** Returns a form schema corresponding to an object/elementType and subType */
function getFormSchema(
  { formSchemas, elementType, subType }:
  { formSchemas: IVeoFormSchema[] | undefined, elementType: string, subType: string }
): IVeoFormSchema | undefined {
  if(!formSchemas) return;

  return formSchemas.find(formSchema =>
    formSchema.modelType === elementType &&
    formSchema.subType === subType
  );
}

/**
 * Translates a subType using values from form schemas.
 * Necessary because objects/elements do not come with a translation.
 */
function getDisplayName({ formSchema }: { formSchema: IVeoFormSchema }) {

  const translation = formSchema?.name[locale.value];
  return translation;
}

// Layout stuff
const miniVariant = useStorage(LOCAL_STORAGE_KEYS.PRIMARY_NAV_MINI_VARIANT, false, localStorage, { serializer: StorageSerializers.boolean });

const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value], domain: props.domainId }));
const fetchTranslationsQueryEnabled = computed(() => authenticated.value);
const { data: translations } = useQuery(translationQueryDefinitions.queries.fetch, fetchTranslationsQueryParameters,  { enabled: fetchTranslationsQueryEnabled });

// objects specific stuff
const objectSchemas = ref<IVeoObjectSchema[]>([]);
const schemasLoading = ref(false);

const queryParameters = computed(() => ({
  domainId: props.domainId as string
}));
const allFormSchemasQueryEnabled = computed(() => !!props.domainId);
const { data: formSchemas } = useQuery(formsQueryDefinitions.queries.fetchForms ,queryParameters, { enabled: allFormSchemasQueryEnabled, placeholderData: [] });

const { data: endpoints } = useQuery(schemaQueryDefinitions.queries.fetchSchemas, undefined, { placeholderData: {} });

const fetchSchemasDetailedQueryParameters = computed(() => ({ domainIds: [props.domainId as string] }));
const fetchSchemasDetailedQueryEnabled = computed(() => !!props.domainId && authenticated.value);
const _schemas = useFetchSchemasDetailed(fetchSchemasDetailedQueryParameters, { enabled: fetchSchemasDetailedQueryEnabled });
watch(
  () => _schemas,
  (newValue) => {
    objectSchemas.value = (newValue || []).map((schema) => schema.data).filter((schema) => schema) as IVeoObjectSchema[];
    schemasLoading.value = (newValue || []).some((schema) => schema.isFetching);
  },
  { deep: true }
);

const objectTypesChildItems = computed<INavItem[]>(() =>
  objectSchemas.value
    .sort((a, b) => (objectTypeSortOrder.get(a.title) || 0) - (objectTypeSortOrder.get(b.title) || 0))
    .map((objectSchema) => {
      const objectSubTypes = extractSubTypesFromObjectSchema(objectSchema);
      const _icon = OBJECT_TYPE_ICONS.get(objectSchema.title);

      return {
        id: objectSchema.title,
        name: upperFirst(translations.value?.lang[locale.value]?.[objectSchema.title] || objectSchema.title),
        icon: _icon?.library === 'mdi' ? _icon?.icon as string : undefined,
        children: [
          // all of object type
          {
            id: `${objectSchema.title}_all`,
            name: upperFirst(t('all').toString()),
            to: {
              name: OBJECT_OVERVIEW_ROUTE_NAME,
              params: {
                unit: props.unitId,
                domain: props.domainId,
                objectType: endpoints.value?.[objectSchema.title],
                subType: '-'
              }
            }
          },

          // dynamic sub type routes
          ...sortBy(
            objectSubTypes.map((subType) => {
              const formSchema = getFormSchema({
                formSchemas: formSchemas?.value,
                elementType: objectSchema?.title,
                subType: subType.subType
              });

              const displayName = getDisplayName({ formSchema }) || subType.subType;

              return {
                id: displayName,
                name: displayName,
                to: {
                  name: OBJECT_OVERVIEW_ROUTE_NAME,
                  params: {
                    unit: props.unitId,
                    domain: props.domainId,
                    objectType: endpoints.value?.[objectSchema.title],
                    subType: subType.subType
                  }
                },
                sorting: formSchema?.sorting
              };
            }),
            'sorting'
          )
        ]
      };
    })
);


// catalog specific stuff
const typeCountQueryParameters = computed(() => ({ domainId: props.domainId as string } ));
const typeCountQueryEnabled = computed(() => !!props.domainId);
const { data: catalogItemTypes, isFetching: catalogItemTypeCountIsLoading } =
  useQuery(catalogQueryDefinitions.queries.fetchCatalogItemTypeCount, typeCountQueryParameters, { enabled: typeCountQueryEnabled });

const catalogsEntriesChildItems = computed<INavItem[]>(() => {
  if(isEmpty(catalogItemTypes?.value || {})) return [];

  const catalogItems = [ ['all', { all: 'MISC' }], ...Object.entries(catalogItemTypes?.value || [])];

  return (catalogItems || []).map(catalogItem => {
    const _icon = CATALOG_TYPE_ICONS.get(catalogItem[0]);
    const _subType = Object.keys(catalogItem[1] || {})[0];

    const formSchema = getFormSchema({
      formSchemas: formSchemas?.value,
      elementType: catalogItem[0],
      subType: _subType,
    });

    const displayName = _subType === 'all' ? t('all') : getDisplayName({formSchema: formSchema}) || _subType;

    return ({
      id: `${catalogItem[0]}`,
      name: displayName, // upperFirst(t(catalogItem[0])),
      subtype: _subType,
      elementType: catalogItem[0],
      icon: _icon?.library === 'mdi' ? _icon?.icon as string : undefined,
      to: {
        name: CATALOGS_CATALOG_ROUTE_NAME,
        params: {
          unit: props.unitId,
          domain: props.domainId,
          catalog: props.domainId
        },
        query: {
          type: catalogItem[0]
        }
      }
    });
  });
});

// report specific stuff
const { data: reports, isFetching: reportsEntriesLoading } = useQuery(reportQueryDefinitions.queries.fetchAll);

const reportsEntriesChildItems = computed<INavItem[]>(
  () =>
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
      .filter((entry) => entry.name) // Don't show reports which aren't translated in the users language
);

// risk specific stuff
const fetchDomainQueryParameters = computed(() => ({ id: props.domainId as string }));
const fetchDomainQueryEnabled = computed(() => !!props.domainId);
const { data: domain, isFetching: riskDefinitionsLoading } = useQuery(domainQueryDefinitions.queries.fetchDomain, fetchDomainQueryParameters, { enabled: fetchDomainQueryEnabled });
const riskDefinitions = computed(() => domain.value?.riskDefinitions || {});

const riskChildItems = computed<INavItem[]>(() =>
  Object.values(riskDefinitions.value).map(({ id }: { id: string }) => ({
    id: id,
    name: id,
    to: {
      name: RISKS_MATRIX_ROUTE_NAME,
      params: {
        unit: props.unitId,
        domain: props.domainId,
        matrix: id
      }
    }
  }))
);

const unitSelectionNavEntry = computed<INavItem>(() =>({
  id: 'unitSelection',
  name: $t('breadcrumbs.index'),
  icon: mdiHomeOutline,
  to: {
    name: UNIT_SELECTION_ROUTE_NAME
  },
  componentName: 'unit-selection-nav-item',
  exact: true,
  openInNewtab: route.path.startsWith("/docs")
}));

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
  exact: true,
  classes: 'mb-4'
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

const profilesNavEntry = computed<INavItem>(() => ({
  id: 'profiles',
  name: $t('breadcrumbs.profiles'),
  icon: mdiShapeOutline,
  componentName: 'profiles-nav-item',
  to: {
    name: PROFILE_ROUTE_NAME,
    params: {
      unit: props.unitId as string,
      domain: props.domainId as string
    }
  }
}));

const reportsNavEntry = computed<INavItem>(() => ({
  id: 'reports',
  name: $t('breadcrumbs.reports').toString(),
  icon: mdiFileChartOutline,
  children: reportsEntriesChildItems.value,
  childrenLoading: reportsEntriesLoading.value,
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
  }
}));

const backToVeoNavEntry = computed<INavItem>(() => ({
  id: 'veo',
  name: t('backToVeo').toString(),
  to: '/',
  icon: mdiHomeOutline,
  componentName: 'veo-nav-item',
  exact: true,
  openInNewtab: route.path.startsWith("/docs")
}));

const docsNavEntry = computed<INavItem>(() => ({
  id: 'docs',
  name: $t('breadcrumbs.docs').toString(),
  to: '/docs/index',
  icon: mdiFileDocumentOutline,
  componentName: 'docs-nav-item',
  children: docNavItems.value
}));

const docItemTransformationFn = (file: NavItem): INavItem => ({
  id: file._path,
  name: file.title,
  to: `/docs${ (file._path.startsWith('/index') ? file._path : file._path.replace('index', '')).replace(/\.\w{2}/, '')}`,
  children: file.children?.length ? file.children.map((file) => docItemTransformationFn(file)) : undefined
});
const docs = useDocNavigation({});
const docNavItems = computed(() =>
  (docs.value || []).map((file) => docItemTransformationFn(file))
);

const items = computed<INavItem[]>(() => [
  ...(authenticated.value && userSettings.value.maxUnits ? [unitSelectionNavEntry.value] : []),
  ...(props.unitId && props.domainId
    ? [
      domainDashboardNavEntry.value,
      ...(props.domainId && props.unitId ? [profilesNavEntry.value] : []),
      ...(props.domainId && props.unitId && ability.value.can('view', 'editors') ? [editorsNavEntry.value] : []),
      objectsNavEntry.value,
      ...(!isEmpty(catalogsEntriesChildItems.value) ? [catalogsNavEntry.value] : []),
      reportsNavEntry.value,
      risksNavEntry.value
    ]
    : []),
  ...(route.path.startsWith('/docs') ? [backToVeoNavEntry.value, docsNavEntry.value] : [])
]);

// Provide the ref to the v-list so children can do stuff with it
const primaryNavList = ref();
provide(PROVIDE_KEYS.navigation, primaryNavList);
</script>

<i18n>
{
  "en": {
    "collapse": "Collapse menu",
    "fix": "Fix menu",
    "all": "all",
    "backToVeo": "Go to verinice.veo",
    "scenario": "Scenario",
    "control": "TOM"
  },
  "de": {
    "collapse": "Menü verstecken",
    "fix": "Menü fixieren",
    "all": "alle",
    "backToVeo": "Zu verinice.veo",
    "scenario": "Gefährdung",
    "control": "TOM"
  }
}
</i18n>

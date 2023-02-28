<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Tino Groteloh, Philipp Ballhausen, Annemarie Bufe,
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
      <v-list :rounded="miniVariant">
        <template
          v-for="item in items"
          :key="item.key"
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
            :mini-variant="miniVariant"
            @expand-menu="miniVariant = false"
          />
        </template>
        <template v-if="authenticated">
          <v-divider class="mb-2" />
          <div class="mx-2">
            <LayoutDemoUnitButton :icon-only="miniVariant" />
          </div>
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
import { RouteLocationRaw } from 'vue-router';
import {
  mdiBookOpenPageVariantOutline,
  mdiChevronLeft,
  mdiChevronRight,
  mdiFileChartOutline,
  mdiFileDocumentOutline,
  mdiHomeOutline,
  mdiHomeSwitchOutline,
  mdiTableSettings,
  mdiTextBoxEditOutline
} from '@mdi/js';
import { sortBy, upperFirst } from 'lodash';
import { StorageSerializers, useStorage } from '@vueuse/core';
import { useDisplay } from 'vuetify';

import { createUUIDUrlParam, extractSubTypesFromObjectSchema } from '~/lib/utils';
import { IVeoFormSchemaMeta, IVeoObjectSchema } from '~/types/VeoTypes';

import { ROUTE_NAME as UNIT_SELECTION_ROUTE_NAME } from '~/pages/index.vue';
import { ROUTE_NAME as DOMAIN_DASHBOARD_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/index.vue';
import { ROUTE_NAME as OBJECTS_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/objects/index.vue';
import { ROUTE_NAME as CATALOGS_CATALOG_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/catalogs/[catalog].vue';
import { ROUTE_NAME as REPORTS_REPORT_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/reports/[report].vue';
import { ROUTE_NAME as RISKS_MATRIX_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/risks/[matrix].vue';
import { ROUTE_NAME as EDITOR_INDEX_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/editor/index.vue';
import { OBJECT_TYPE_ICONS } from '~/components/object/Icon.vue';
import { useFetchForms } from '~/composables/api/forms';
import { useVeoUser } from '~/composables/VeoUser';
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useFetchSchemasDetailed } from '~/composables/api/schemas';
import { useDocNavigation } from '~/composables/docs';
import { useFetchTranslations } from '~/composables/api/translations';
import { useFetchReports } from '~/composables/api/reports';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import { useFetchCatalogs } from '~/composables/api/catalogs';
import { useFetchDomain } from '~/composables/api/domains';

export interface INavItem {
  key: string;
  name: string;
  icon?: string;
  faIcon?: string | string[];
  exact?: boolean;
  to?: RouteLocationRaw;
  children?: INavItem[];
  childrenLoading?: boolean;
  componentName?: string;
  classes?: string;
  activePath?: string;
}

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

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: true
    },
    unitId: {
      type: String,
      default: undefined
    },
    domainId: {
      type: String,
      default: undefined
    }
  },
  setup(props) {
    const { t, locale } = useI18n();
    const { t: $t } = useI18n({ useScope: 'global' });
    const { authenticated, userSettings } = useVeoUser();
    const route = useRoute();
    const { ability } = useVeoPermissions();
    const { xs } = useDisplay();

    // Layout stuff
    const miniVariant = useStorage(LOCAL_STORAGE_KEYS.PRIMARY_NAV_MINI_VARIANT, false, localStorage, { serializer: StorageSerializers.boolean });

    const fetchTranslationsQueryParameters = computed(() => ({ languages: [locale.value] }));
    const { data: translations } = useFetchTranslations(fetchTranslationsQueryParameters);

    // objects specific stuff
    const objectSchemas = ref<IVeoObjectSchema[]>([]);
    const schemasLoading = ref(false);

    const queryParameters = computed(() => ({
      domainId: props.domainId || ''
    }));
    const allFormSchemasQueryEnabled = computed(() => !!props.domainId);
    const { data: formSchemas } = useFetchForms(queryParameters, { enabled: allFormSchemasQueryEnabled, placeholderData: [] });

    const fetchSchemasDetailedQueryParameters = computed(() => ({ domainIds: [props.domainId || ''] }));
    const fetchSchemasDetailedQueryEnabled = computed(() => !!props.domainId);
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
            key: objectSchema.title,
            name: upperFirst(translations.value?.lang[locale.value]?.[objectSchema.title] || objectSchema.title),
            icon: _icon?.library === 'mdi' ? _icon?.icon as string : undefined,
            faIcon: _icon?.library === 'fa' ? _icon?.icon : undefined,
            activePath: `/${route.params.unit}/domains/${route.params.domain}/objects?objectType=${objectSchema.title}`,
            children: [
              // all of object type
              {
                key: `${objectSchema.title}_all`,
                name: upperFirst(t('all').toString()),
                to: {
                  name: OBJECTS_ROUTE_NAME,
                  params: {
                    unit: createUUIDUrlParam('unit', props.unitId),
                    domain: createUUIDUrlParam('domain', props.domainId)
                  },
                  query: {
                    objectType: objectSchema.title
                  }
                },
                exact: true
              },
              // dynamic sub type routes
              ...sortBy(
                objectSubTypes.map((subType) => {
                  const formSchema = (formSchemas.value as IVeoFormSchemaMeta[]).find(
                    (formSchema) => formSchema.modelType === objectSchema.title && formSchema.subType === subType.subType
                  );
                  const displayName = formSchema?.name[locale.value] || subType.subType;
                  return {
                    key: displayName,
                    name: displayName,
                    to: {
                      name: OBJECTS_ROUTE_NAME,
                      params: {
                        unit: createUUIDUrlParam('unit', props.unitId),
                        domain: createUUIDUrlParam('domain', props.domainId)
                      },
                      query: {
                        objectType: objectSchema.title,
                        subType: subType.subType
                      }
                    },
                    exact: true,
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
    const fetchCatalogsQueryParameters = computed(() => ({ domainId: props.domainId }));
    const fetchCatalogsQueryEnabled = computed(() => !!props.domainId);
    const { data: catalogs, isFetching: catalogsEntriesLoading } = useFetchCatalogs(fetchCatalogsQueryParameters, { enabled: fetchCatalogsQueryEnabled });

    const catalogsEntriesChildItems = computed<INavItem[]>(() =>
      catalogs.value.map((catalog) => ({
        key: catalog.id,
        name: catalog.name,
        to: {
          name: CATALOGS_CATALOG_ROUTE_NAME,
          params: {
            unit: createUUIDUrlParam('unit', props.unitId),
            domain: createUUIDUrlParam('domain', props.domainId),
            catalog: createUUIDUrlParam('catalog', catalog.id)
          }
        }
      }))
    );

    // report specific stuff
    const { data: reports, isFetching: reportsEntriesLoading } = useFetchReports();

    const reportsEntriesChildItems = computed<INavItem[]>(
      () =>
        Object.entries(reports.value || {})
          .map(([reportId, report]) => ({
            key: reportId,
            name: report.name[locale.value],
            exact: true,
            to: {
              name: REPORTS_REPORT_ROUTE_NAME,
              params: {
                unit: createUUIDUrlParam('unit', props.unitId),
                domain: createUUIDUrlParam('domain', props.domainId),
                report: reportId
              }
            }
          }))
          .filter((entry) => entry.name) // Don't show reports which aren't translated in the users language
    );

    // risk specific stuff
    const fetchDomainQueryParameters = computed(() => ({ id: props.domainId || '' }));
    const fetchDomainQueryEnabled = computed(() => !!props.domainId);
    const { data: domain, isFetching: riskDefinitionsLoading } = useFetchDomain(fetchDomainQueryParameters, { enabled: fetchDomainQueryEnabled });
    const riskDefinitions = computed(() => domain.value?.riskDefinitions || {});

    const riskChildItems = computed<INavItem[]>(() =>
      Object.values(riskDefinitions.value).map(({ id }: { id: string }) => ({
        key: id,
        name: id,
        to: {
          name: RISKS_MATRIX_ROUTE_NAME,
          params: {
            unit: createUUIDUrlParam('unit', props.unitId),
            domain: createUUIDUrlParam('domain', props.domainId),
            matrix: id
          }
        }
      }))
    );

    const unitSelectionNavEntry: INavItem = {
      key: 'unitSelection',
      name: $t('breadcrumbs.index').toString(),
      icon: mdiHomeSwitchOutline,
      to: {
        name: UNIT_SELECTION_ROUTE_NAME
      },
      componentName: 'unit-select-nav-item',
      exact: true
    };

    const domainDashboardNavEntry = computed<INavItem>(() => ({
      key: 'domainDashboard',
      name: $t('domain.index.title').toString(),
      icon: mdiHomeOutline,
      to: {
        name: DOMAIN_DASHBOARD_ROUTE_NAME,
        params: {
          unit: createUUIDUrlParam('unit', props.unitId),
          domain: createUUIDUrlParam('domain', props.domainId)
        }
      },
      componentName: 'domain-dashboard-nav-item',
      exact: true,
      classes: 'mb-4'
    }));

    const objectsNavEntry = computed<INavItem>(() => ({
      key: 'objects',
      name: $t('breadcrumbs.objects').toString(),
      activePath: `${route.params.unit}/domains/${route.params.domain}/objects`,
      faIcon: ['far', 'object-ungroup'],
      children: objectTypesChildItems.value,
      childrenLoading: schemasLoading.value,
      componentName: 'objects-nav-item'
    }));

    const catalogsNavEntry = computed<INavItem>(() => ({
      key: 'catalogs',
      name: $t('breadcrumbs.catalogs').toString(),
      activePath: `${route.params.unit}/domains/${route.params.domain}/catalogs`,
      icon: mdiBookOpenPageVariantOutline,
      children: catalogsEntriesChildItems.value,
      childrenLoading: catalogsEntriesLoading.value,
      componentName: 'catalogs-nav-item'
    }));

    const reportsNavEntry = computed<INavItem>(() => ({
      key: 'reports',
      name: $t('breadcrumbs.reports').toString(),
      activePath: `${route.params.unit}/domains/${route.params.domain}/reports`,
      icon: mdiFileChartOutline,
      children: reportsEntriesChildItems.value,
      childrenLoading: reportsEntriesLoading.value,
      componentName: 'reports-nav-item'
    }));

    const risksNavEntry = computed<INavItem>(() => ({
      key: 'risks',
      name: $t('breadcrumbs.risks').toString(),
      activePath: `${route.params.unit}/domains/${route.params.domain}/risks`,
      icon: mdiTableSettings,
      children: riskChildItems.value,
      childrenLoading: riskDefinitionsLoading.value,
      componentName: 'risks-nav-item'
    }));

    const editorsNavEntry = computed<INavItem>(() => ({
      key: 'editors',
      name: $t('breadcrumbs.editor').toString(),
      icon: mdiTextBoxEditOutline,
      to: {
        name: EDITOR_INDEX_ROUTE_NAME,
        params: {
          unit: createUUIDUrlParam('unit', props.unitId),
          domain: createUUIDUrlParam('domain', props.domainId)
        }
      }
    }));

    const backToVeoNavEntry = computed<INavItem>(() => ({
      key: 'veo',
      name: t('backToVeo').toString(),
      to: '/',
      icon: mdiHomeOutline,
      componentName: 'veo-nav-item',
      exact: true
    }));

    const docsNavEntry = computed<INavItem>(() => ({
      key: 'docs',
      name: $t('breadcrumbs.docs').toString(),
      to: '/docs/index',
      icon: mdiFileDocumentOutline,
      componentName: 'docs-nav-item',
      activePath: '/docs',
      children: docNavItems.value
    }));
    
    const docs = useDocNavigation({});
    const docNavItems = computed(() => 
      (docs.value || []).map(
        (file) => {
          return {
            key: file.path,
            name: file.title,
            to: `/docs${file._path.replace(/index.\w{2}/, '')}`,
            activePath: file._path
          };
        }
      )
    );

    const items = computed<INavItem[]>(() => [
      ...(authenticated.value && userSettings.value.maxUnits && userSettings.value.maxUnits > 2 ? [unitSelectionNavEntry] : []),
      ...(props.unitId && props.domainId
        ? [
          domainDashboardNavEntry.value,
          ...(props.domainId && props.unitId && ability.value.can('view', 'editors') ? [editorsNavEntry.value] : []),
          objectsNavEntry.value,
          catalogsNavEntry.value,
          reportsNavEntry.value,
          risksNavEntry.value
        ]
        : []),
      ...(route.path.startsWith('/docs') ? [backToVeoNavEntry.value, docsNavEntry.value] : [])
    ]);

    // Starting with VEO-692, we don't always want to redirect to the unit selection (in fact we always want to redirect to the last used unit and possibly domain)
    const homeLink = computed(() =>
      route.params.domain ? `/${route.params.unit}/domains/${route.params.domain}` : route.params.unit ? `/${route.params.unit}` : '/'
    );

    return {
      authenticated,
      items,
      homeLink,
      miniVariant,

      route,
      t,
      mdiChevronLeft,
      mdiChevronRight,
      xs
    };
  }
});
</script>

<i18n>
{
  "en": {
    "collapse": "Collapse menu",
    "fix": "Fix menu",
    "all": "all",
    "backToVeo": "Go to verinice.veo"
  },
  "de": {
    "collapse": "Menü verstecken",
    "fix": "Menü fixieren",
    "all": "alle",
    "backToVeo": "Zu verinice.veo"
  }
}
</i18n>
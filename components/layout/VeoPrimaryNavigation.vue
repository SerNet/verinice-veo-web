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
    :width="290"
    :value="value"
    app
    floating
    :mini-variant="!$vuetify.breakpoint.xs && miniVariant"
    :permanent="!$vuetify.breakpoint.xs"
    :temporary="$vuetify.breakpoint.xs"
    class="veo-primary-navigation"
    v-on="$listeners"
  >
    <template #default>
      <div class="d-flex flex-column fill-height">
        <div>
          <slot
            name="header"
            v-bind="{ miniVariant }"
          />
        </div>
        <v-list
          nav
          dense
          :rounded="miniVariant"
          expand
          class="fill-height d-flex flex-column"
        >
          <template
            v-for="(item, index) in items"
          >
            <VeoPrimaryNavigationEntry
              :key="index"
              v-bind="item"
              path="#"
              :level="0"
              :mini-variant="miniVariant"
              @expand-menu="setMiniVariant(false)"
              @collapse-other-submenus="onCollapseMenus"
            />
          </template>
          <v-divider class="my-4" />
          <slot
            name="append-content"
            v-bind="{ miniVariant }"
          />
        </v-list>
      </div>
    </template>
    <template #append>
      <v-list
        nav
        dense
        class="pa-0"
      >
        <v-divider style="background: rgba(255, 255, 255, 0.2)" />
        <v-list-item
          v-if="!$vuetify.breakpoint.xs"
          class="pl-4"
          @click="setMiniVariant(!miniVariant)"
        >
          <v-list-item-icon>
            <v-icon
              v-if="miniVariant"
              color="black"
            >
              {{ mdiChevronDoubleRight }}
            </v-icon>
            <v-icon
              v-else
              color="black"
            >
              {{ mdiChevronDoubleLeft }}
            </v-icon>
          </v-list-item-icon>
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
import { computed, defineComponent, provide, reactive, ref, useContext, useFetch, useRoute, watch } from '@nuxtjs/composition-api';
import {
  mdiApplicationCogOutline,
  mdiChevronDoubleLeft,
  mdiChevronDoubleRight,
  mdiClipboardListOutline,
  mdiFileChartOutline,
  mdiFileDocumentOutline,
  mdiFormatListBulleted,
  mdiHomeOutline,
  mdiTableLarge
} from '@mdi/js';
import { RawLocation } from 'vue-router/types';
import { useI18n } from 'nuxt-i18n-composable';
import { sortBy, upperFirst } from 'lodash';

import LocalStorage from '~/util/LocalStorage';
import { createUUIDUrlParam, extractSubTypesFromObjectSchema } from '~/lib/utils';
import { IVeoCatalog, IVeoDomain, IVeoFormSchemaMeta, IVeoObjectSchema, IVeoReportsMeta } from '~/types/VeoTypes';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';

import { ROUTE_NAME as UNIT_SELECTION_ROUTE_NAME } from '~/pages/index.vue';
import { ROUTE_NAME as DOMAIN_DASHBOARD_ROUTE_NAME } from '~/pages/_unit/domains/_domain/index.vue';
import { ROUTE_NAME as OBJECTS_ROUTE_NAME } from '~/pages/_unit/domains/_domain/objects/index.vue';
import { ROUTE_NAME as CATALOGS_CATALOG_ROUTE_NAME } from '~/pages/_unit/domains/_domain/catalogs/_catalog.vue';
import { ROUTE_NAME as REPORTS_REPORT_ROUTE_NAME } from '~/pages/_unit/domains/_domain/reports/_type.vue';
import { ROUTE_NAME as RISKS_MATRIX_ROUTE_NAME } from '~/pages/_unit/domains/_domain/risks/_matrix.vue';
import { ROUTE_NAME as EDITOR_INDEX_ROUTE_NAME } from '~/pages/_unit/domains/_domain/editor/index.vue';

export interface INavItem {
  name: string;
  icon?: string;
  to?: RawLocation;
  childItems?: INavItem[];
  childItemsLoading?: boolean;
  partOfActivePath?: boolean;
  exact?: boolean;
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
  name: 'VeoPrimaryNavigation',
  props: {
    value: {
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
    const { $api, $user } = useContext();
    const route = useRoute();

    // Layout stuff
    const miniVariant = ref<boolean>(LocalStorage.primaryNavMiniVariant);

    function setMiniVariant(_miniVariant: boolean) {
      miniVariant.value = _miniVariant;
      LocalStorage.primaryNavMiniVariant = miniVariant.value;
    }

    // objects specific stuff
    const objectTypes = ref<IVeoSchemaEndpoint[]>([]);
    const objectSchemas = ref<IVeoObjectSchema[]>([]);
    const formSchemas = ref<IVeoFormSchemaMeta[]>([]);
    const { fetch: fetchObjectsEntries, fetchState: objectEntriesLoading } = useFetch(async () => {
      // Only load object types on the first call, as them changing while the user is using the application is highly unlikely
      if (!objectTypes.value.length) {
        objectTypes.value = await $api.schema.fetchAll();
      }
      objectSchemas.value = [];

      // We only load the objectschemas to avoid loading some when the domain id is set and some if it isn't set
      if (props.domainId) {
        for (const objectType of objectTypes.value) {
          objectSchemas.value.push(await $api.schema.fetch(objectType.schemaName, [props.domainId]));
        }
        formSchemas.value = await $api.form.fetchAll(props.domainId);
      }
    });

    const objectTypesChildItems = computed<INavItem[]>(() =>
      objectSchemas.value
        .sort((a, b) => (objectTypeSortOrder.get(a.title) || 0) - (objectTypeSortOrder.get(b.title) || 0))
        .map((objectSchema) => {
          const objectSubTypes = extractSubTypesFromObjectSchema(objectSchema);

          return {
            name: upperFirst(objectSchema.title),
            partOfActivePath: route.value.fullPath.includes(`/unit-${props.unitId}/domains/domain-${props.domainId}/objects?objectType=${objectSchema.title}`),
            childItems: [
              // all of object type
              {
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
                }
              },
              // dynamic sub type routes
              ...sortBy(
                objectSubTypes.map((subType) => {
                  const formSchema = formSchemas.value.find((formSchema) => formSchema.modelType === objectSchema.title && formSchema.subType === subType.subType);
                  const displayName = formSchema?.name[locale.value] || subType.subType;
                  return {
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
                    disabled: false,
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
    const catalogs = ref<IVeoCatalog[]>([]);
    const { fetch: fetchCatalogsEntries, fetchState: catalogsEntriesLoading } = useFetch(async () => {
      catalogs.value = await $api.catalog.fetchAll(props.domainId);
    });

    const catalogsEntriesChildItems = computed<INavItem[]>(() =>
      catalogs.value.map((catalog) => ({
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
    const reports = ref<IVeoReportsMeta>({});
    const { fetchState: reportsEntriesLoading } = useFetch(async () => {
      reports.value = await $api.report.fetchAll();
    });

    const reportsEntriesChildItems = computed<INavItem[]>(
      () =>
        Object.keys(reports.value)
          .map((reportId: string) => ({
            name: reports.value[reportId].name[locale.value],
            to: {
              name: REPORTS_REPORT_ROUTE_NAME,
              params: {
                unit: createUUIDUrlParam('unit', props.unitId),
                domain: createUUIDUrlParam('domain', props.domainId),
                type: reportId
              }
            }
          }))
          .filter((entry) => entry.name) // Don't show reports which aren't translated in the users language
    );

    // risk specific stuff
    const riskDefinitions = ref<IVeoDomain['riskDefinitions']>({});
    const { fetchState: riskDefinitionsLoading } = useFetch(async () => {
      riskDefinitions.value = (await $api.domain.fetch(props.domainId)).riskDefinitions;
    });

    const riskChildItems = computed<INavItem[]>(() =>
      Object.values(riskDefinitions.value).map(({ id }: { id: string }) => ({
        name: id,
        exact: false,
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

    // nav item stuff
    const maxUnits = computed<number | undefined>(() => {
      const _maxUnits = $user.auth.profile?.attributes?.maxUnits?.[0];

      return _maxUnits ? parseInt(_maxUnits, 10) : _maxUnits;
    });

    const isContentCreator = computed(() => !!$user.auth.roles.find((r: string) => r === 'veo-content-creator'));

    // Reload certain navigation items if domain changes
    watch(
      () => props.domainId,
      () => {
        fetchObjectsEntries();
        fetchCatalogsEntries();
      }
    );

    /* const spacer: INavItem = {
      name: 'spacer'
    }; */

    const unitSelectionNavEntry: INavItem = {
      name: t('breadcrumbs.index').toString(),
      icon: mdiFormatListBulleted,
      to: {
        name: UNIT_SELECTION_ROUTE_NAME
      }
    };

    const domainDashboardNavEntry = computed<INavItem>(() => ({
      name: t('domain.index.title').toString(),
      icon: mdiHomeOutline,
      to: {
        name: DOMAIN_DASHBOARD_ROUTE_NAME,
        params: {
          unit: createUUIDUrlParam('unit', props.unitId),
          domain: createUUIDUrlParam('domain', props.domainId)
        }
      }
    }));

    const objectsNavEntry = computed<INavItem>(() => ({
      name: t('breadcrumbs.objects').toString(),
      icon: mdiFileDocumentOutline,
      to: undefined,
      childItems: objectTypesChildItems.value,
      childItemsLoading: objectEntriesLoading.pending,
      partOfActivePath: route.value.fullPath.includes(`/unit-${props.unitId}/domains/domain-${props.domainId}/objects`)
    }));

    const catalogsNavEntry = computed<INavItem>(() => ({
      name: t('breadcrumbs.catalogs').toString(),
      icon: mdiClipboardListOutline,
      to: undefined,
      childItems: catalogsEntriesChildItems.value,
      childItemsLoading: catalogsEntriesLoading.pending,
      partOfActivePath: route.value.fullPath.includes(`/unit-${props.unitId}/domains/domain-${props.domainId}/catalogs`)
    }));

    const reportsNavEntry = computed<INavItem>(() => ({
      name: t('breadcrumbs.reports').toString(),
      icon: mdiFileChartOutline,
      to: undefined,
      childItems: reportsEntriesChildItems.value,
      childItemsLoading: reportsEntriesLoading.pending,
      partOfActivePath: route.value.fullPath.includes(`/unit-${props.unitId}/domains/domain-${props.domainId}/reports`)
    }));

    const risksNavEntry = computed<INavItem>(() => ({
      name: t('breadcrumbs.risks').toString(),
      icon: mdiTableLarge,
      to: undefined,
      childItems: riskChildItems.value,
      childItemsLoading: riskDefinitionsLoading.pending,
      partOfActivePath: route.value.fullPath.includes(`/unit-${props.unitId}/domains/domain-${props.domainId}/risks`)
    }));

    const editorsNavEntry = computed<INavItem>(() => ({
      name: t('breadcrumbs.editor').toString(),
      icon: mdiApplicationCogOutline,
      to: {
        name: EDITOR_INDEX_ROUTE_NAME,
        params: {
          unit: createUUIDUrlParam('unit', props.unitId),
          domain: createUUIDUrlParam('domain', props.domainId)
        }
      },
      exact: false
    }));

    const items = computed<INavItem[]>(() => [
      ...(maxUnits.value && maxUnits.value > 2 ? [unitSelectionNavEntry] : []),
      ...(props.unitId && props.domainId
        ? [domainDashboardNavEntry.value, objectsNavEntry.value, catalogsNavEntry.value, reportsNavEntry.value, risksNavEntry.value /*, editorsNavEntry.value */]
        : []),
      ...(props.domainId && props.unitId && isContentCreator.value ? [editorsNavEntry.value] : [])
    ]);

    const expandedNavItems = reactive<string[]>([]);
    provide('expandedNavItems', expandedNavItems);

    const addExpandedNavItemsToSet = (item: INavItem, previousPath: string) => {
      const newPath = `${previousPath}/${item.name}`;

      if (item.partOfActivePath && !expandedNavItems.includes(newPath)) {
        expandedNavItems.push(newPath);
      }

      for (const child of item.childItems || []) {
        addExpandedNavItemsToSet(child, newPath);
      }
    };

    watch(
      () => items.value,
      () => {
        for (const item of items.value) {
          addExpandedNavItemsToSet(item, '#');
        }
      }
    );

    const onCollapseMenus = (itemToExpandKey: string) => {
      // If The key is already part of the array, collapse the item
      if (!expandedNavItems.includes(itemToExpandKey)) {
        expandedNavItems.push(itemToExpandKey);
      } else {
        const index = expandedNavItems.findIndex((key) => key === itemToExpandKey);
        expandedNavItems.splice(index, 1);
      }

      for (let i = 0; i < expandedNavItems.length; i++) {
        const key = expandedNavItems[i];

        // Only remove items on second level or below that are not parents of the clicked element. We splice as to not completely remove the object. This would destroy reactivity
        if (key.split('/').length > 2 && !itemToExpandKey.includes(key)) {
          expandedNavItems.splice(i, 1);
          i--;
        }
      }
    };

    return {
      items,
      miniVariant,
      onCollapseMenus,
      setMiniVariant,

      mdiChevronDoubleLeft,
      mdiChevronDoubleRight,
      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "collapse": "Collapse menu",
    "fix": "Fix menu",
    "all": "all"
  },
  "de": {
    "collapse": "Menü verstecken",
    "fix": "Menü fixieren",
    "all": "alle"
  }
}
</i18n>

<style lang="scss" scoped>
.veo-primary-navigation.v-navigation-drawer {
  background-color: $background-accent;
  border-right: 1px solid $medium-grey;
}
</style>

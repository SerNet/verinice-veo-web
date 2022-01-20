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
    :class="{ 'v-application--is-rtl': right }"
    clipped
    :mini-variant="!$vuetify.breakpoint.xs && miniVariant"
    :permanent="!$vuetify.breakpoint.xs"
    :temporary="$vuetify.breakpoint.xs"
    :right="right"
    v-on="$listeners"
  >
    <template #default>
      <div class="d-flex flex-column fill-height">
        <!-- Default menu -->
        <v-list
          nav
          dense
          :shaped="!miniVariant"
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
              :loading="$fetchState.pending"
              :collapsed.sync="item.collapsed"
              :mini-variant="miniVariant"
              :persist-u-i-state="item.persistCollapsedState"
              @update:collapsed="onUpdateCollapsed(index, $event)"
              @update-mini-variant="setMiniVariant($event)"
            />
          </template>
        </v-list>
      </div>
    </template>
    <template #append>
      <v-list
        nav
        dense
        class="pa-0"
      >
        <v-divider />
        <v-list-item
          v-if="!$vuetify.breakpoint.xs"
          class="pl-4"
          @click="setMiniVariant(!miniVariant)"
        >
          <v-list-item-icon>
            <v-icon v-if="miniVariant">
              mdi-chevron-double-right
            </v-icon>
            <v-icon v-else>
              mdi-chevron-double-left
            </v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="miniVariant">
            {{ $t('fix') }}
          </v-list-item-title>
          <v-list-item-title v-else>
            {{ $t('collapse') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue';
import { sortBy, upperFirst } from 'lodash';
import { computed, ComputedRef } from '@nuxtjs/composition-api';
import { mdiClipboardList, mdiFileChart, mdiFileDocument, mdiHome } from '@mdi/js';

import { RawLocation } from 'vue-router/types';
import { ROUTE_NAME as OBJECTS_ROUTE_NAME } from '~/pages/_unit/domains/_domain/objects/index.vue';
import LocalStorage from '~/util/LocalStorage';
import { createUUIDUrlParam } from '~/lib/utils';
import { IVeoCatalog, IVeoDomain, IVeoFormSchemaMeta, IVeoReportsMeta } from '~/types/VeoTypes';
import { VeoEvents } from '~/types/VeoGlobalEvents';
import { IVeoSchemaEndpoint } from '~/plugins/api/schema';

export interface INavItem {
  name: string;
  icon?: string;
  exact?: boolean;
  to?: RawLocation;
  disabled: boolean;
  childItems?: INavItem[];
  collapsed?: boolean;
  topLevelItem: boolean;
  persistCollapsedState?: (collapsed: boolean) => void;
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

export default Vue.extend({
  name: 'VeoPrimaryNavigation',
  props: {
    right: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: true
    },
    domainId: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      miniVariant: LocalStorage.primaryNavMiniVariant,
      domains: [] as IVeoDomain[],
      objectTypes: [] as IVeoSchemaEndpoint[],
      objectSubTypes: {} as { [k: string]: string[] },
      reportTypes: [] as INavItem[],
      catalogs: [] as INavItem[],
      formSchemas: [] as IVeoFormSchemaMeta[] // for translations
    };
  },
  async fetch() {
    this.domains = await this.$api.domain.fetchAll();

    if (this.domains.length === 1) {
      this.$user.updateLastDomain(this.domains[0].id);
    }

    if (this.domainId) {
      // Load all form schemas to use sub types' translated names instead of their keys in the menu
      this.formSchemas = await this.$api.form.fetchAll(this.domainId);

      await this.fetchObjectTypes(this.domainId);
      this.reportTypes = await this.fetchReportTypes(this.domainId);
      this.catalogs = await this.fetchCatalogs(this.domainId);
    }
  },
  computed: {
    objectTypeItems(): INavItem[] {
      return [...this.objectTypes]
        .sort((a, b) => (objectTypeSortOrder.get(a.schemaName) || 0) - (objectTypeSortOrder.get(b.schemaName) || 0))
        .map((objectType) => {
          const objectTypeKey = objectType.schemaName;
          const unitParameter = this.$route.params.unit;
          const domainParameter = createUUIDUrlParam('domain', this.domainId);
          return {
            name: upperFirst(objectTypeKey),
            exact: false,
            disabled: false,
            collapsed: true,
            topLevelItem: true,
            childItems: [
              // all of object type
              {
                name: upperFirst(this.$t('all').toString()),
                to: {
                  name: OBJECTS_ROUTE_NAME,
                  params: {
                    unit: unitParameter,
                    domain: domainParameter
                  },
                  query: {
                    objectType: objectTypeKey
                  }
                },
                exact: true,
                disabled: false,
                topLevelItem: false
              },
              // dynamic sub type routes
              ...sortBy(
                (this.objectSubTypes[objectTypeKey] || []).map((subTypeKey) => {
                  const displayName = this.formSchemas.find((formSchema) => formSchema.subType === subTypeKey)?.name[this.$i18n.locale] || subTypeKey;
                  return {
                    name: displayName,
                    to: {
                      name: OBJECTS_ROUTE_NAME,
                      params: {
                        unit: unitParameter,
                        domain: domainParameter
                      },
                      query: {
                        objectType: objectTypeKey,
                        subType: subTypeKey
                      }
                    },
                    exact: true,
                    disabled: false,
                    topLevelItem: false
                  };
                }),
                'name'
              )
            ]
          };
        });
    },
    items(): INavItem[] {
      const domainDashboard: INavItem = {
        name: this.$t('domain.index.title').toString(),
        icon: mdiHome,
        exact: true,
        to: `/${this.$route.params.unit}/domains/${createUUIDUrlParam('domain', this.domainId || '')}`,
        disabled: false,
        topLevelItem: true
      };

      const objects: INavItem = {
        name: this.$t('breadcrumbs.objects').toString(),
        icon: mdiFileDocument,
        to: undefined,
        exact: false,
        disabled: false,
        childItems: this.objectTypeItems,
        collapsed: LocalStorage.expandedNavEntry !== 1,
        persistCollapsedState: (collapsed) => (LocalStorage.expandedNavEntry = collapsed ? -1 : 1),
        topLevelItem: true
      };

      /* const spacer: INavItem = {
        name: 'spacer',
        disabled: false,
        topLevelItem: true
      }; */

      const unitSelection: INavItem = {
        name: this.$t('breadcrumbs.index').toString(),
        icon: mdiHome,
        to: '/',
        exact: true,
        disabled: false,
        topLevelItem: true
      };

      /* const editors: INavItem = {
        name: this.$t('breadcrumbs.editor').toString(),
        icon: 'mdi-application-cog',
        to: '/editor',
        exact: false,
        disabled: false,
        topLevelItem: true
      }; */

      const reports = {
        name: this.$t('breadcrumbs.reports').toString(),
        icon: mdiFileChart,
        to: undefined,
        exact: false,
        disabled: false,
        childItems: this.reportTypes,
        persistCollapsedState: (collapsed: boolean) => (LocalStorage.expandedNavEntry = collapsed ? -1 : 3),
        collapsed: LocalStorage.expandedNavEntry !== 3,
        topLevelItem: true
      };

      const catalogs = {
        name: this.$t('breadcrumbs.catalogs').toString(),
        icon: mdiClipboardList,
        to: undefined,
        exact: false,
        disabled: false,
        childItems: this.catalogs,
        persistCollapsedState: (collapsed: boolean) => (LocalStorage.expandedNavEntry = collapsed ? -1 : 4),
        collapsed: LocalStorage.expandedNavEntry !== 4,
        topLevelItem: true
      };

      const maxUnits: ComputedRef<number | undefined> = computed(() => {
        const _maxUnits = this.$user.auth.profile?.attributes?.maxUnits?.[0];

        return _maxUnits ? parseInt(_maxUnits, 10) : _maxUnits;
      });

      return [
        ...(!this.$route.params.unit || !maxUnits.value || maxUnits.value > 2 ? [unitSelection] : []),
        ...(this.domainId ? [domainDashboard, objects, catalogs, reports] : [])
        /* spacer,
        editors */
      ];
    }
  },
  watch: {
    domainId() {
      this.$fetch();
    }
  },
  mounted() {
    this.$root.$on(VeoEvents.UNIT_CREATED, () => {
      this.$nextTick(() => {
        setTimeout(() => this.$fetch(), 5000);
      });
    });
  },
  methods: {
    createUUIDUrlParam,
    async fetchObjectTypes(domainId: string) {
      this.objectTypes = await this.$api.schema.fetchAll();
      const subTypePromises = this.objectTypes.map((objectType) => this.$api.schema.fetch(objectType.schemaName, [domainId]));
      const objectSchemas = await Promise.all(subTypePromises);
      this.objectSubTypes = Object.fromEntries(
        objectSchemas.map((schema) => {
          const subTypes = Object.values(schema.properties.domains.properties)[0].allOf?.map((mapping) => mapping.if.properties.subType.const) || [];
          return [schema.title, subTypes];
        })
      );
    },
    async fetchReportTypes(domainId: string): Promise<INavItem[]> {
      return await this.$api.report.fetchAll().then((reportTypes: IVeoReportsMeta) =>
        Object.entries(reportTypes)
          .map(([key, value]) => {
            const name = value.name[this.$i18n.locale];
            return {
              name,
              exact: false,
              to: `/${this.$route.params.unit}/domains/${createUUIDUrlParam('domain', domainId)}/reports/${key}/`,
              disabled: false,
              topLevelItem: false
            };
          })
          .filter((report) => report.name)
      );
    },
    async fetchCatalogs(domainId: string): Promise<INavItem[]> {
      if (domainId) {
        const catalogs = await this.$api.catalog.fetchAll(domainId);
        return catalogs.map((catalog: IVeoCatalog) => ({
          name: catalog.name,
          exact: false,
          to: `/${this.$route.params.unit}/domains/${createUUIDUrlParam('domain', domainId)}/catalogs/${createUUIDUrlParam('catalog', catalog.id)}/`,
          disabled: false,
          topLevelItem: false
        }));
      } else {
        return await Promise.resolve([]);
      }
    },
    setMiniVariant(miniVariant: boolean) {
      this.miniVariant = miniVariant;
      LocalStorage.primaryNavMiniVariant = miniVariant;
    },
    onUpdateCollapsed(itemIndex: number, collapsed: boolean) {
      this.items[itemIndex].collapsed = collapsed;
      this.items[itemIndex].persistCollapsedState?.(collapsed);

      // As only one item should be expanded at a time, we collapse all other
      this.items.forEach((item, index) => {
        if (item.collapsed === false && index !== itemIndex) {
          this.items[index].collapsed = true;
          this.items[index].persistCollapsedState?.(true);
        }
      });
    }
  }
});
</script>

<i18n>
{
  "en": {
    "collapse": "Collapse menu",
    "fix": "Fix menu",
    "noChildItems": "No sub items",
    "all": "all"
  },
  "de": {
    "collapse": "Menü verstecken",
    "fix": "Menü fixieren",
    "noChildItems": "Keine Einträge vorhanden",
    "all": "alle"
  }
}
</i18n>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.v-application--is-rtl {
  ::v-deep .v-tabs-bar {
    transform: scaleX(-1);
    .v-tab {
      transform: scaleX(-1);
    }
  }
}

.veo-active-link-item {
  color: $primary !important;
}

::v-deep .veo-active-link-group {
  color: rgba(0, 0, 0, 0.54) !important;

  .v-list-item__title {
    color: rgba(0, 0, 0, 0.87) !important;
  }
}
</style>

<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Tino Groteloh, Philipp Ballhausen, Annemarie Bufe
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
          <template v-for="(item, index) in items">
            <VeoPrimaryNavigationEntry
              :key="index"
              v-bind="item"
              :collapsed.sync="item.collapsed"
              :mini-variant="miniVariant"
              :persist-u-i-state="item.persistCollapsedState"
              @update:collapsed="onUpdateCollapsed(index, $event)"
              @update-mini-variant="setMiniVariant($event)"
            />
          </template>
          <v-list-item
            class="flex-grow-0 flex-basis-auto veo-primary-navigation__menu-item"
            @click="displayDeploymentDetails = true"
          >
            <v-list-item-icon>
              <v-icon>
                mdi-information-outline
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ $t('about') }}</v-list-item-title>
            <VeoDeploymentDetailsDialog v-model="displayDeploymentDetails" />
          </v-list-item>
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
import { upperFirst } from 'lodash';
import { ComputedRef } from '@vue/composition-api';
import { computed } from '@nuxtjs/composition-api';
import LocalStorage from '~/util/LocalStorage';

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { IVeoCatalog, IVeoDomain, IVeoFormSchemaMeta, IVeoReportsMeta } from '~/types/VeoTypes';
import { nonLinkableSchemas } from '~/plugins/api/schema';

export interface INavItem {
  name: string;
  icon?: string;
  exact?: boolean;
  to?: string;
  disabled: boolean;
  childItems?: INavItem[];
  collapsed?: boolean;
  topLevelItem: boolean;
  persistCollapsedState?: (collapsed: boolean) => void;
}

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
      displayDeploymentDetails: false as boolean,
      domains: [] as IVeoDomain[],
      objectTypes: [] as INavItem[],
      formTypes: [] as INavItem[],
      reportTypes: [] as INavItem[],
      catalogs: [] as INavItem[]
    };
  },
  async fetch() {
    this.domains = await this.$api.domain.fetchAll();

    if (this.domains.length === 1) {
      this.$user.updateLastDomain(this.domains[0].id);
    }

    this.objectTypes = await this.fetchObjectTypes();

    if (this.domainId) {
      this.formTypes = await this.fetchFormTypes(this.domainId);
      this.reportTypes = await this.fetchReportTypes(this.domainId);
      this.catalogs = await this.fetchCatalogs(this.domainId);
    }
  },
  computed: {
    items(): INavItem[] {
      /* VEO-692
      const unitDashboard: INavItem = {
        name: this.$t('unit.index.title').toString(),
        icon: 'mdi-home',
        exact: true,
        to: `/${routeUnitParam}/`,
        disabled: false,
        topLevelItem: true
      };
      */
      const domainDashboard: INavItem = {
        name: this.$t('domain.index.title').toString(),
        icon: 'mdi-view-dashboard',
        exact: true,
        to: `/${this.$route.params.unit}/domains/${createUUIDUrlParam('domain', this.domainId || '')}`,
        disabled: false,
        topLevelItem: true
      };
      const scopes: INavItem = {
        name: this.$t('breadcrumbs.scopes').toString(),
        icon: 'mdi-archive',
        exact: false,
        to: `/${this.$route.params.unit}/scopes`,
        disabled: false,
        topLevelItem: true
      };
      const objects: INavItem = {
        name: this.$t('breadcrumbs.objects').toString(),
        icon: 'mdi-file-document',
        to: undefined,
        exact: false,
        disabled: false,
        childItems: this.objectTypes,
        collapsed: LocalStorage.expandedNavEntry !== 1,
        persistCollapsedState: (collapsed) => (LocalStorage.expandedNavEntry = collapsed ? -1 : 1),
        topLevelItem: true
      };

      const divider: INavItem = {
        name: 'divider',
        disabled: false,
        topLevelItem: true
      };

      const spacer: INavItem = {
        name: 'spacer',
        disabled: false,
        topLevelItem: true
      };

      const unitSelection: INavItem = {
        name: this.$t('breadcrumbs.index').toString(),
        icon: 'mdi-home',
        to: '/',
        exact: true,
        disabled: false,
        topLevelItem: true
      };

      const editors: INavItem = {
        name: this.$t('breadcrumbs.editor').toString(),
        icon: 'mdi-application-cog',
        to: '/editor',
        exact: false,
        disabled: false,
        topLevelItem: true
      };

      const forms = {
        name: this.$t('breadcrumbs.forms').toString(),
        icon: 'mdi-format-list-checks',
        to: undefined,
        exact: false,
        disabled: false,
        childItems: this.formTypes,
        persistCollapsedState: (collapsed: boolean) => (LocalStorage.expandedNavEntry = collapsed ? -1 : 2),
        collapsed: LocalStorage.expandedNavEntry !== 2,
        topLevelItem: true
      };

      const reports = {
        name: this.$t('breadcrumbs.reports').toString(),
        icon: 'mdi-file-chart',
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
        icon: 'mdi-clipboard-list',
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
        ...(this.domainId ? [domainDashboard, forms, catalogs, reports] : []),
        ...(this.$route.params.unit ? [divider, /* VEO-692 unitDashboard, */ scopes, objects] : []),
        spacer,
        editors
      ];
    }
  },
  watch: {
    domainId() {
      this.$fetch();
    }
  },
  methods: {
    createUUIDUrlParam,
    fetchObjectTypes(): Promise<INavItem[]> {
      const routeUnitParam = this.$route.params.unit;
      return this.$api.schema.fetchAll().then((data) => {
        return data
          .filter((entry) => !nonLinkableSchemas.includes(entry.schemaName))
          .map((entry) => {
            return {
              name: upperFirst(entry.schemaName),
              exact: false,
              to: `/${routeUnitParam}/objects/${entry.endpoint}/`,
              disabled: false,
              topLevelItem: false
            };
          });
      });
    },
    async fetchFormTypes(domainId: string): Promise<INavItem[]> {
      const routeUnitParam = separateUUIDParam(this.$route.params.unit).id;
      const forms = await this.$api.form.fetchAll(domainId);
      return forms.map((entry: IVeoFormSchemaMeta) => ({
        name: entry.name[this.$i18n.locale] || 'Missing translation',
        exact: false,
        to: `/${createUUIDUrlParam('unit', routeUnitParam)}/domains/${createUUIDUrlParam('domain', domainId)}/forms/${createUUIDUrlParam('form', entry?.id || '')}/`,
        disabled: false,
        topLevelItem: false
      }));
    },
    async fetchReportTypes(domainId: string): Promise<INavItem[]> {
      return await this.$api.report.fetchAll().then((reportTypes: IVeoReportsMeta) =>
        Object.entries(reportTypes).map(([key, value]) => {
          const name = value.name[this.$i18n.locale] || value.name[0];
          return {
            name,
            exact: false,
            to: `/${this.$route.params.unit}/domains/${createUUIDUrlParam('domain', domainId)}/reports/${key}/`,
            disabled: false,
            topLevelItem: false
          };
        })
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
    "about": "About",
    "collapse": "Collapse menu",
    "fix": "Fix menu",
    "noChildItems": "No sub items"
  },
  "de": {
    "about": "Über",
    "collapse": "Menü verstecken",
    "fix": "Menü fixieren",
    "noChildItems": "Keine Einträge vorhanden"
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

.veo-primary-navigation__menu-item {
  flex-basis: auto;
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

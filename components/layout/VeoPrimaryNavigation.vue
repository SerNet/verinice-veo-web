<template>
  <v-navigation-drawer
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
        <!-- Current domain -->
        <div v-if="$route.params.unit">
          <span
            class="mx-3"
          >{{ $t('breadcrumbs.domain') }}</span>
          <v-select
            :value="domainId"
            :items="domains"
            item-text="name"
            item-value="id"
            solo
            flat
            hide-details
            style="font-size: 1.2rem;"
            :placeholder="$route.name !== 'unit-domains-more' ? $t('noDomainSelected') : $t('breadcrumbs.more_modules')"
            :menu-props="{closeOnContentClick: true, 'max-width': '256px', 'content-class': 'veo-primary-navigation__domain-selection-menu'}"
            @change="onDomainChange"
          >
            <template #append-item>
              <v-divider class="mt-6" />
              <v-list-item
                :to="`/${$route.params.unit}/domains/more`"
                exact-active-class="veo-active-link-item"
              >
                {{ $t('breadcrumbs.more_modules') }}
              </v-list-item>
            </template>
          </v-select>
        </div>
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
        </v-list>
      </div>
    </template>
    <template #append>
      <v-list
        nav
        dense
        class="pa-0"
      >
        <v-list-item
          class="pl-4"
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
import { Route } from 'vue-router';
import { upperFirst } from 'lodash';
import LocalStorage from '~/util/LocalStorage';

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { IVeoDomain, IVeoFormSchemaMeta, IVeoReportsMeta } from '~/types/VeoTypes';
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
    }
  },
  data() {
    return {
      miniVariant: LocalStorage.primaryNavMiniVariant,
      domains: [] as IVeoDomain[],
      items: [] as INavItem[],
      displayDeploymentDetails: false as boolean
    };
  },
  computed: {
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    }
  },
  watch: {
    '$route.params.unit'() {
      this.getNavEntries(this.$route);
    },
    '$route.params.domain'() {
      this.getNavEntries(this.$route);
    }
  },
  mounted() {
    this.getNavEntries(this.$route);
    this.$i18n.onLanguageSwitched = () => {
      this.getNavEntries(this.$route);
    };
  },
  methods: {
    createUUIDUrlParam,
    async getNavEntries(route: Route) {
      const routeUnitParam = route.params.unit;
      const domainId = separateUUIDParam(route.params.domain).id;

      const unitDashboard: INavItem = {
        name: this.$t('unit.index.title').toString(),
        icon: 'mdi-home',
        exact: true,
        to: `/${routeUnitParam}/`,
        disabled: false,
        topLevelItem: true
      };
      const domainDashboard: INavItem = {
        name: this.$t('domain.index.title').toString(),
        icon: 'mdi-view-dashboard',
        exact: true,
        to: `/${routeUnitParam}/domains/${route.params.domain}`,
        disabled: false,
        topLevelItem: true
      };
      const scopes: INavItem = {
        name: this.$t('breadcrumbs.scopes').toString(),
        icon: 'mdi-archive',
        exact: false,
        to: `/${route.params.unit}/scopes`,
        disabled: false,
        topLevelItem: true
      };
      const objects: INavItem = {
        name: this.$t('breadcrumbs.objects').toString(),
        icon: 'mdi-file-document',
        to: undefined,
        exact: false,
        disabled: false,
        childItems: undefined,
        collapsed: LocalStorage.expandedNavEntry !== 1,
        persistCollapsedState: (collapsed) => (LocalStorage.expandedNavEntry = collapsed ? -1 : 1),
        topLevelItem: true
      };
      const settings: INavItem = {
        name: this.$t('breadcrumbs.settings').toString(),
        icon: 'mdi-cog',
        to: `/${routeUnitParam}/settings`,
        disabled: false,
        topLevelItem: true
      };
      const help: INavItem = {
        name: this.$t('breadcrumbs.help').toString(),
        icon: 'mdi-help',
        to: `/${routeUnitParam}/help`,
        disabled: false,
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
        childItems: undefined,
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
        childItems: undefined,
        persistCollapsedState: (collapsed: boolean) => (LocalStorage.expandedNavEntry = collapsed ? -1 : 3),
        collapsed: LocalStorage.expandedNavEntry !== 3,
        topLevelItem: true
      };

      this.domains = await this.$api.domain.fetchAll();

      this.items = [
        ...(domainId ? [domainDashboard, forms, reports] : []),
        ...(routeUnitParam ? [divider, unitDashboard, scopes, objects] : []),
        ...(!routeUnitParam ? [unitSelection] : []),
        spacer,
        ...(routeUnitParam ? [settings] : []),
        editors,
        ...(routeUnitParam ? [help] : [])
      ];

      this.addChildren(this.$t('breadcrumbs.objects').toString(), await this.fetchObjectTypes());
      this.addChildren(this.$t('breadcrumbs.forms').toString(), await this.fetchFormTypes(domainId));
      this.addChildren(this.$t('breadcrumbs.reports').toString(), await this.fetchReportTypes(domainId));
    },
    /**
     * Add children to a menu item
     *
     * @param itemTitle The name of the item to add the children to.
     * @oaram items The items to add to the parent item.
     */
    addChildren(itemTitle: string, items: INavItem[], overwrite: boolean = true) {
      const menuItem = this.items.find((item: INavItem) => item.name === itemTitle);
      if (menuItem) {
        if (items.length === 0) {
          menuItem.childItems = [
            {
              topLevelItem: false,
              name: this.$t('noChildItems').toString(),
              disabled: false
            }
          ];
          return;
        }

        if (overwrite) {
          menuItem.childItems = items;
        } else {
          if (!menuItem.childItems) {
            menuItem.childItems = [];
          }
          menuItem.childItems.push(...items);
        }
      }
    },
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
    },
    onDomainChange(domainId: string) {
      this.$router.push(`/${this.$route.params.unit}/domains/${createUUIDUrlParam('domain', domainId)}`);
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
    "noChildItems": "No sub items",
    "noDomainSelected": "No module selected"
  },
  "de": {
    "about": "Über",
    "collapse": "Menü verstecken",
    "fix": "Menü fixieren",
    "noChildItems": "Keine Einträge vorhanden",
    "noDomainSelected": "Kein Modul ausgewählt"
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

<style lang="scss">
.veo-primary-navigation__domain-selection-menu {
  left: 0 !important;
}
</style>
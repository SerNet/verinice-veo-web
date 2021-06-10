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
      <v-list
        nav
        dense
        :shaped="!miniVariant"
        :rounded="miniVariant"
        expand
        class="d-flex flex-column fill-height"
      >
        <template v-for="(item, index) in items">
          <VeoPrimaryNavigationEntry
            :key="item.name"
            v-bind="item"
            :collapsed.sync="item.collapsed"
            :mini-variant="miniVariant"
            :persist-u-i-state="item.persistCollapsedState"
            @update:collapsed="onUpdateCollapsed(index, $event)"
            @update-mini-variant="setMiniVariant($event)"
          />
        </template>
      </v-list>
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
      items: [] as INavItem[]
    };
  },
  computed: {
    objectToToggleObjectFormCollapse() {
      return {
        [this.$t('breadcrumbs.objects') as string]: this.$t('breadcrumbs.forms') as string,
        [this.$t('breadcrumbs.forms') as string]: this.$t('breadcrumbs.objects') as string
      };
    },
    domainId(): string {
      return separateUUIDParam(this.$route.params.domain).id;
    }
  },
  watch: {
    '$route.params.unit'() {
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
    async getNavEntries(route: Route) {
      const routeUnitParam = route.params.unit;

      const dashboard: INavItem = {
        name: this.$t('unit.index.title').toString(),
        icon: 'mdi-view-dashboard',
        exact: true,
        to: `/${routeUnitParam}/`,
        disabled: false,
        topLevelItem: true
      };
      const moreModules: INavItem = {
        name: this.$t('breadcrumbs.more_modules').toString(),
        icon: 'mdi-cart-outline',
        exact: true,
        to: `/${routeUnitParam}/domains/more`,
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
        collapsed: true,
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

      const domains = await this.$api.domain.fetchAll();

      const domainItems: INavItem[] = domains.map((domain: IVeoDomain) => ({
        name: domain.name,
        icon: 'mdi-format-section',
        to: undefined,
        exact: false,
        disabled: false,
        childItems: [],
        collapsed: true,
        topLevelItem: true
      }));

      this.items = [
        ...(routeUnitParam ? [dashboard, ...domainItems, moreModules, scopes, objects] : []),
        ...(!routeUnitParam ? [unitSelection] : []),
        spacer,
        ...(routeUnitParam ? [settings, help] : []),
        editors
      ];

      this.addChildren(this.$t('breadcrumbs.objects').toString(), await this.fetchObjectTypes());
      this.loadDomainContent(domains);
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
              to: `/${routeUnitParam}/objects/${entry.endpoint}/-/`,
              disabled: false,
              childItems: undefined,
              collapsed: false,
              topLevelItem: false
            };
          });
      });
    },
    async fetchFormTypes(domain: IVeoDomain): Promise<INavItem[]> {
      const routeUnitParam = separateUUIDParam(this.$route.params.unit).id;
      return await this.$api.form.fetchAll(domain.id).then((formTypes: IVeoFormSchemaMeta[]) =>
        formTypes.map((entry: IVeoFormSchemaMeta) => {
          return {
            name: entry.name,
            exact: false,
            to: `/${createUUIDUrlParam('unit', routeUnitParam)}/domains/${domain.id}/forms/${createUUIDUrlParam('form', entry?.id || '')}/`,
            disabled: false,
            topLevelItem: false
          };
        })
      );
    },
    async fetchReportTypes(domain: IVeoDomain): Promise<INavItem[]> {
      return await this.$api.report.fetchAll().then((reportTypes: IVeoReportsMeta) =>
        Object.entries(reportTypes).map(([key, value]) => {
          const name = value.name[this.$i18n.locale] || value.name[0];
          return {
            name,
            exact: false,
            to: `/${this.$route.params.unit}/domains/${domain.id}/reports/${key}/`,
            disabled: false,
            topLevelItem: false
          };
        })
      );
    },
    async loadDomainContent(domains: IVeoDomain[]) {
      // Load content for each domain
      for (const domain of domains) {
        const domainItems = [
          {
            name: this.$t('breadcrumbs.forms') as string,
            icon: 'mdi-format-list-checks',
            to: undefined,
            exact: false,
            disabled: false,
            childItems: await this.fetchFormTypes(domain),
            collapsed: false,
            topLevelItem: false
          },
          {
            name: this.$t('breadcrumbs.reports') as string,
            icon: 'mdi-file-chart',
            to: undefined,
            exact: false,
            disabled: false,
            childItems: await this.fetchReportTypes(domain),
            collapsed: false,
            topLevelItem: false
          }
        ];

        this.addChildren(domain.name, domainItems);
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
    "fix": "Fix menu"
  },
  "de": {
    "collapse": "Menü verstecken",
    "fix": "Menü fixieren"
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

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
    <div class="d-flex flex-column fill-height">
      <v-list
        nav
        dense
        :shaped="!miniVariant"
        :rounded="miniVariant"
        expand
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
    </div>
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
import { IVeoFormSchemaMeta, IVeoReportsMeta } from '~/types/VeoTypes';
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
    getNavEntries(route: Route) {
      this.items = [];
      // Only show nav links belonging to units if a unit is selected
      if ((route.params.unit && separateUUIDParam(route.params.unit).id) !== undefined) {
        const routeUnitParam = route.params.unit;
        this.items = [
          {
            name: this.$t('unit.index.title') as string,
            icon: 'mdi-view-dashboard',
            exact: true,
            to: `/${routeUnitParam}/`,
            disabled: false,
            topLevelItem: true
          },
          {
            name: this.$t('breadcrumbs.scopes') as string,
            icon: 'mdi-archive',
            exact: false,
            to: `/${route.params.unit}/scopes`,
            disabled: false,
            topLevelItem: true
          },
          {
            name: this.$t('breadcrumbs.objects') as string,
            icon: 'mdi-file-document',
            to: undefined,
            exact: false,
            disabled: false,
            childItems: undefined,
            collapsed: LocalStorage.navEntryVeoDataCollapsed,
            persistCollapsedState: (collapsed: boolean) => (LocalStorage.navEntryVeoDataCollapsed = collapsed),
            topLevelItem: true
          },
          {
            name: this.$t('breadcrumbs.forms') as string,
            icon: 'mdi-format-list-checks',
            to: undefined,
            exact: false,
            disabled: false,
            childItems: undefined,
            collapsed: LocalStorage.navEntryVeoFormsCollapsed,
            persistCollapsedState: (collapsed: boolean) => (LocalStorage.navEntryVeoFormsCollapsed = collapsed),
            topLevelItem: true
          },
          {
            name: this.$t('breadcrumbs.reports') as string,
            icon: 'mdi-file-chart',
            to: undefined,
            exact: false,
            disabled: false,
            childItems: undefined,
            collapsed: LocalStorage.navEntryVeoReportsCollapsed,
            persistCollapsedState: (collapsed: boolean) => (LocalStorage.navEntryVeoReportsCollapsed = collapsed),
            topLevelItem: true
          },
          {
            name: this.$t('breadcrumbs.settings') as string,
            icon: 'mdi-cog',
            to: `/${routeUnitParam}/settings`,
            disabled: false,
            topLevelItem: true
          },
          {
            name: this.$t('breadcrumbs.help') as string,
            icon: 'mdi-help',
            to: `/${routeUnitParam}/help`,
            disabled: false,
            topLevelItem: true
          }
        ];

        // Async loading of child elements (done now as to not block the rendering of the menu)
        this.fetchDataTypes().then((data: INavItem[]) => {
          this.items[2].childItems = data;
        });
        this.fetchFormTypes().then((data: INavItem[]) => {
          this.items[3].childItems = data;
        });
        this.fetchReportTypes().then((data: INavItem[]) => {
          this.items[4].childItems = data;
        });
      } else {
        this.items.push({
          name: this.$t('breadcrumbs.index') as string,
          icon: 'mdi-home',
          to: '/',
          exact: true,
          disabled: false,
          topLevelItem: true
        });
      }

      // Add permanent entries to the nav bar
      this.items.push({
        name: this.$t('breadcrumbs.editor') as string,
        icon: 'mdi-application-cog',
        to: '/editor',
        exact: false,
        disabled: false,
        topLevelItem: true
      });
    },
    async fetchDataTypes(): Promise<INavItem[]> {
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

    async fetchFormTypes(): Promise<INavItem[]> {
      const routeUnitParam = separateUUIDParam(this.$route.params.unit).id;
      return await this.$api.form.fetchAll({ unit: routeUnitParam }).then((formTypes: IVeoFormSchemaMeta[]) =>
        formTypes.map((entry: IVeoFormSchemaMeta) => {
          return {
            name: entry.name,
            exact: false,
            to: `/${createUUIDUrlParam('unit', routeUnitParam)}/forms/${createUUIDUrlParam('form', entry?.id || '')}/`,
            disabled: false,
            topLevelItem: false
          };
        })
      );
    },
    async fetchReportTypes(): Promise<INavItem[]> {
      return await this.$api.report.fetchAll().then((reportTypes: IVeoReportsMeta) =>
        Object.entries(reportTypes).map(([key, value]) => {
          const name = value.name[this.$i18n.locale] || value.name[0];
          return {
            name,
            exact: false,
            to: `/${this.$route.params.unit}/reports/${key}/`,
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

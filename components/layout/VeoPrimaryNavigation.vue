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
      <v-list nav dense :shaped="!miniVariant" :rounded="miniVariant" expand>
        <template v-for="(item, index) in items">
          <VeoPrimaryNavigationEntry
            :key="item.name"
            v-bind="item"
            :collapsed.sync="item.collapsed"
            :mini-variant="miniVariant"
            @update:collapsed="onUpdateCollapsed(index, $event)"
            :persist-u-i-state="item.persistCollapsedState"
            @update-mini-variant="setMiniVariant($event)"
          />
        </template>
      </v-list>
    </div>
    <template #append>
      <v-list nav dense class="pa-0">
        <v-divider />
        <v-list-item v-if="!$vuetify.breakpoint.xs" class="pl-4" @click="setMiniVariant(!miniVariant)">
          <v-list-item-icon>
            <v-icon v-if="miniVariant">mdi-chevron-double-right</v-icon>
            <v-icon v-else>mdi-chevron-double-left</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="miniVariant">{{ $t('global.menu.expand') }}</v-list-item-title>
          <v-list-item-title v-else>{{ $t('global.menu.collapse') }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router'
import { capitalize } from 'lodash'
import LocalStorage from '~/util/LocalStorage'

import VeoPrimaryNavigationEntry from '~/components/layout/VeoPrimaryNavigationEntry.vue'
import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils'
import { IVeoFormSchemaMeta } from '~/types/VeoTypes'

export interface INavItem {
  name: string
  icon?: string
  exact?: boolean
  to?: string
  disabled: boolean
  childItems?: INavItem[]
  collapsed?: boolean
  topLevelItem: boolean
  persistCollapsedState?: (collapsed: boolean) => void
}

export default Vue.extend({
  name: 'VeoPrimaryNavigation',
  components: {
    VeoPrimaryNavigationEntry
  },
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
    }
  },
  watch: {
    '$route.params.unit'() {
      this.getNavEntries(this.$route)
    }
  },
  mounted() {
    this.getNavEntries(this.$route)
    this.$i18n.onLanguageSwitched = () => {
      this.getNavEntries(this.$route)
    }
  },
  computed: {
    objectToToggleObjectFormCollapse() {
      return {
        [this.$t('breadcrumbs.objects') as string]: this.$t('breadcrumbs.forms') as string,
        [this.$t('breadcrumbs.forms') as string]: this.$t('breadcrumbs.objects') as string
      }
    }
  },
  methods: {
    getNavEntries(route: Route) {
      this.items = []
      // Only show nav links belonging to units if a unit is selected
      if ((route.params.unit && separateUUIDParam(route.params.unit).id) !== undefined) {
        const routeUnitParam = route.params.unit
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
            name: this.$t('page.settings.title') as string,
            icon: 'mdi-cog',
            to: `/${routeUnitParam}/settings`,
            disabled: false,
            topLevelItem: true
          },
          {
            name: this.$t('page.help.title') as string,
            icon: 'mdi-help',
            to: `/${routeUnitParam}/help`,
            disabled: false,
            topLevelItem: true
          }
        ]

        // Async loading of child elements (done now as to not block the rendering of the menu)
        this.fetchDataTypes().then((data: INavItem[]) => {
          this.items[2].childItems = data
        })
        this.fetchFormTypes().then((data: INavItem[]) => {
          this.items[3].childItems = data
        })
      } else {
        this.items.push({
          name: this.$t('page.index.title') as string,
          icon: 'mdi-home',
          to: '/',
          exact: true,
          disabled: false,
          topLevelItem: true
        })
      }

      // Add permanent entries to the nav bar
      this.items.push({
        name: this.$t('page.editors.title') as string,
        icon: 'mdi-application-cog',
        to: '/editor',
        exact: false,
        disabled: false,
        topLevelItem: true
      })
    },
    async fetchDataTypes(): Promise<INavItem[]> {
      const routeUnitParam = this.$route.params.unit
      return this.$api.schema.fetchAll().then(data => {
        return data.map(entry => {
          return {
            name: capitalize(entry.schemaName),
            exact: false,
            to: `/${routeUnitParam}/objects/${entry.endpoint}/-/`,
            disabled: false,
            childItems: undefined,
            collapsed: false,
            topLevelItem: false
          }
        })
      })
    },

    async fetchFormTypes(): Promise<INavItem[]> {
      const routeUnitParam = separateUUIDParam(this.$route.params.unit).id
      return await this.$api.form.fetchAll({ unit: routeUnitParam }).then((formTypes: IVeoFormSchemaMeta[]) =>
        formTypes.map((entry: IVeoFormSchemaMeta) => {
          return {
            name: entry.name,
            exact: false,
            to: `/${createUUIDUrlParam('unit', routeUnitParam)}/forms/${createUUIDUrlParam('form', entry.id)}/`,
            disabled: false,
            topLevelItem: false
          }
        })
      )
    },
    setMiniVariant(miniVariant: boolean) {
      this.miniVariant = miniVariant
      LocalStorage.primaryNavMiniVariant = miniVariant
    },
    onUpdateCollapsed(itemIndex: number, collapsed: boolean) {
      this.items[itemIndex].collapsed = collapsed
      this.items[itemIndex].persistCollapsedState?.(collapsed)
      // Get an index of the opposite forms vs. object
      const toggleItemIndex = this.items.findIndex(
        ({ name }) => name === this.objectToToggleObjectFormCollapse[this.items[itemIndex].name]
      )
      // If opposite item index exists, the item is opened and the current item was also opened, close the opposite
      if (toggleItemIndex !== -1 && !this.items[toggleItemIndex].collapsed && !collapsed) {
        this.items[toggleItemIndex].collapsed = true
        this.items[toggleItemIndex].persistCollapsedState?.(true)
      }
    }
  }
})
</script>

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

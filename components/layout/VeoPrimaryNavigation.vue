<template>
  <v-navigation-drawer :value="drawer" app :class="{'v-application--is-rtl': right}" clipped :mini-variant="!$vuetify.breakpoint.xs && drawer" :permanent="!$vuetify.breakpoint.xs" :temporary="$vuetify.breakpoint.xs" :right="right" @input="$emit('update:drawer', $event)" @mouseenter.native="onMouseEnter()" @mouseleave.native="onMouseLeave()">
    <div class="d-flex flex-column fill-height">
      <v-list nav dense :shaped="!drawer" :rounded="drawer" expand>
        <template v-for="item in items">
          <VeoPrimaryNavigationEntry :key="item.name" v-bind="item" :extended.sync="item.extended" :persist-u-i-state="persistUIState" />
        </template>
      </v-list>
      <v-spacer />
      <v-list nav dense class="pa-0">
        <v-divider />
        <v-list-item v-if="!$vuetify.breakpoint.xs" class="pl-4" @click="toggleMenu()">
          <v-list-item-icon>
            <v-icon v-if="drawer || openedOnHover">mdi-chevron-double-right</v-icon>
            <v-icon v-else>mdi-chevron-double-left</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="drawer || openedOnHover">{{ $t('global.menu.expand') }}</v-list-item-title>
          <v-list-item-title v-else>{{ $t('global.menu.collapse') }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue'
import { Route } from 'vue-router'
import { FormSchemaMeta, FormSchemaMetas, ObjectSchemaNames } from '~/types/FormSchema'

import VeoPrimaryNavigationEntry from '~/components/layout/VeoPrimaryNavigationEntry.vue'

export interface INavItem {
  name: string,
  icon?: string,
  exact?: boolean,
  to?: string,
  disabled: boolean,
  childItems?: INavItem[],
  extended?: boolean
  topLevelItem: boolean
}

export default Vue.extend({
  components: {
    VeoPrimaryNavigationEntry
  },
  props: {
    right: {
      type: Boolean,
      default: false
    },
    drawer: {
      type: Boolean,
      default: undefined
    }
  },
  data() {
    return {
      openedOnHover: false as boolean,
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
    // Closes the menu if the cursor leaves the browser
    document.addEventListener('mouseleave', this.onMouseLeave)

    // Loads the menu state from the preferences
    const fixedMenu = this.fetchUIState().persistentMenu
    if (fixedMenu !== undefined) {
      this.$nextTick(() => {
        this.$emit('update:drawer', !fixedMenu)
      })
    }
  },
  destroyed() {
    // Closes the menu if the cursor leaves the browser
    document.removeEventListener('mouseleave', this.onMouseLeave)
  },
  methods: {
    onMouseEnter() {
      // If this.drawer is true, the mini-variant is displayed
      if (!this.$vuetify.breakpoint.xs && this.drawer) {
        this.openedOnHover = true
        setTimeout(() => {
          if (this.openedOnHover) {
            this.$emit('update:drawer', false)
          }
        }, 200)
      }
    },
    onMouseLeave() {
      if (!this.$vuetify.breakpoint.xs && !this.drawer && this.openedOnHover) {
        this.$emit('update:drawer', true)
      }
      this.openedOnHover = false
    },
    getNavEntries(route: Route) {
      this.items = []
      // Only show nav links belonging to units if a unit is selected
      if (route.params.unit !== undefined) {
        this.items = [
          {
            name: this.$t('unit.index.title') as string,
            icon: 'mdi-view-dashboard',
            exact: true,
            to: `/${route.params.unit}/`,
            disabled: false,
            topLevelItem: true
          },
          {
            name: 'veo.data',
            icon: 'mdi-folder',
            to: undefined,
            disabled: false,
            childItems: undefined,
            extended: this.fetchUIState()['veo.data'] ? !this.fetchUIState()['veo.data'] : true,
            topLevelItem: true
          },
          {
            name: 'veo.forms',
            icon: 'mdi-format-list-checks',
            to: undefined,
            disabled: false,
            childItems: undefined,
            extended: this.fetchUIState()['veo.forms'] ? !this.fetchUIState()['veo.forms'] : true,
            topLevelItem: true
          },
          {
            name: this.$t('page.settings.title') as string,
            icon: 'mdi-cog',
            to: `/${route.params.unit}/settings`,
            disabled: false,
            topLevelItem: true
          },
          {
            name: this.$t('page.help.title') as string,
            icon: 'mdi-help',
            to: `/${route.params.unit}/help`,
            disabled: false,
            topLevelItem: true
          }
        ]

        // Async loading of child elements (done now as to not block the rendering of the menu)
        this.fetchDataTypes().then((data: INavItem[]) => {
          this.items[1].childItems = data
        })
        this.fetchFormTypes().then((data: INavItem[]) => {
          this.items[2].childItems = data
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
    toggleMenu() {
      if (!this.drawer && this.openedOnHover) {
        this.openedOnHover = false
        this.persistUIState('persistentMenu', true)
      } else if (!this.drawer) {
        this.openedOnHover = false
        this.$emit('update:drawer', true)
        this.persistUIState('persistentMenu', false)
      } else {
        this.$emit('update:drawer', !this.drawer)
        this.persistUIState('persistentMenu', true)
      }
    },
    async fetchDataTypes(): Promise<INavItem[]> {
      const objects: INavItem[] = []
      const keys = Object.keys(ObjectSchemaNames)

      for await (const key of keys) {
        // TODO: Implement groups
        await this.$api.group.fetchAll({ type: this.capitalize(key), unit: this.$route.params.unit }).then((data) => {
          if (data.length > 0) {
          }
        })

        objects.push({
          name: this.$t(`unit.data.type.${key}`) as string,
          exact: true,
          to: `/${this.$route.params.unit}/data/${key}/-/`,
          disabled: false,
          childItems: undefined,
          extended: this.fetchUIState()[this.$t(`unit.data.type.${key}`) as string] ? !this.fetchUIState()[this.$t(`unit.data.type.${key}`) as string] : true,
          topLevelItem: false
        })
      }

      return objects
    },
    async fetchFormTypes(): Promise<INavItem[]> {
      return await this.$api.form.fetchAll({ unit: this.$route.params.unit }).then((formTypes: FormSchemaMetas) => formTypes.map((entry: FormSchemaMeta) => {
        return {
          name: entry.name,
          exact: true,
          to: `/${this.$route.params.unit}/forms/${entry.id}/`,
          disabled: false,
          topLevelItem: false
        }
      }))
    },
    capitalize(string: string): string {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    /**
     * Used to store the current ui settings in the local storage to reconstruct the layout on page reload.
     */
    persistUIState(item: string, state: boolean) {
      // fetch state from local storage
      const preferences = this.fetchUIState()
      preferences[item] = state

      // Overwrite fetched state
      localStorage.setItem('veo-menu-preferences', JSON.stringify(preferences))
    },
    fetchUIState(): { [key:string]: boolean } {
      return JSON.parse(localStorage.getItem('veo-menu-preferences') || '{}')
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

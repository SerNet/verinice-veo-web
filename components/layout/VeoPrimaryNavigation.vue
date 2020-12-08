<template>
  <v-navigation-drawer app :class="{'v-application--is-rtl': right}" clipped :mini-variant="drawer" :permanent="!$vuetify.breakpoint.xs" :right="right" @input="$emit('update:drawer', $event)" @mouseenter.native="onMouseEnter()" @mouseleave.native="onMouseLeave()">
    <div class="d-flex flex-column fill-height">
      <v-list nav dense :shaped="!drawer" :rounded="drawer" expand>
        <template v-for="item in items">
          <v-list-item v-if="item.childItems === undefined" :key="item.name" :to="item.to" :exact="item.exact" :disabled="item.disabled" active-class="veo-active-link-item">
            <v-list-item-icon v-if="item.icon">
              <v-icon v-text="item.icon" />
            </v-list-item-icon>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item>
          <v-list-group v-else :key="item.name" v-model="item.extended" no-action :prepend-icon="item.icon" active-class="veo-active-link-group" @click="persistSubmenuUIState(item.name, item.extended)">
            <template #activator>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </template>
            <v-list-item v-for="child of item.childItems" :key="child.name" :to="child.to" :exact="child.exact" :disabled="child.disabled" active-class="veo-active-link-item">
              <v-list-item-title>{{ child.name }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
        </template>
      </v-list>
      <v-spacer />
      <v-list nav dense class="pa-0">
        <v-divider />
        <v-list-item class="pl-4" @click="toggleMenu()">
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

export interface INavItem {
  name: string,
  icon?: string,
  exact?: boolean,
  to?: string,
  disabled: boolean,
  childItems?: INavItem[],
  extended?: boolean
}

export default Vue.extend({
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
      if (this.drawer) {
        this.openedOnHover = true
        setTimeout(() => {
          if (this.openedOnHover) {
            this.$emit('update:drawer', false)
          }
        }, 200)
      }
    },
    onMouseLeave() {
      if (!this.drawer && this.openedOnHover) {
        this.$emit('update:drawer', true)
      }
      this.openedOnHover = false
    },
    async getNavEntries(route: Route) {
      this.items = []
      // Only show nav links belonging to units if a unit is selected
      if (route.params.unit !== undefined) {
        this.items = [
          {
            name: this.$t('unit.index.title') as string,
            icon: 'mdi-view-dashboard',
            exact: true,
            to: `/${route.params.unit}/`,
            disabled: false
          },
          {
            name: 'veo.data',
            icon: 'mdi-folder',
            to: undefined,
            disabled: false,
            childItems: await this.fetchDataTypes(),
            extended: this.fetchUIState().dataCollapsed ? !this.fetchUIState().dataCollapsed : true
          },
          {
            name: 'veo.forms',
            icon: 'mdi-format-list-checks',
            to: undefined,
            disabled: false,
            childItems: await this.fetchFormTypes(),
            extended: this.fetchUIState().formsCollapsed ? !this.fetchUIState().formsCollapsed : true
          },
          {
            name: this.$t('page.settings.title') as string,
            icon: 'mdi-cog',
            to: `/${route.params.unit}/settings`,
            disabled: false
          },
          {
            name: this.$t('page.help.title') as string,
            icon: 'mdi-help',
            to: `/${route.params.unit}/help`,
            disabled: false
          }
        ]
      } else {
        this.items.push({
          name: this.$t('page.index.title') as string,
          icon: 'mdi-home',
          to: '/',
          exact: false,
          disabled: false
        })
      }

      // Add permanent entries to the nav bar
      this.items.push({
        name: this.$t('page.editors.title') as string,
        icon: 'mdi-application-cog',
        to: '/editor',
        exact: false,
        disabled: false
      })
    },
    toggleMenu() {
      if (!this.drawer && this.openedOnHover) {
        this.openedOnHover = false
        this.persistUIState(true)
      } else if (!this.drawer) {
        this.openedOnHover = false
        this.$emit('update:drawer', true)
        this.persistUIState(false)
      } else {
        this.$emit('update:drawer', !this.drawer)
        this.persistUIState(true)
      }
    },
    async fetchDataTypes(): Promise<INavItem[]> {
      const objects: INavItem[] = []
      const keys = Object.keys(ObjectSchemaNames)

      for await (const key of keys) {
        // TODO: Implement groups
        await this.$api.group.fetchAll({ type: this.capitalize(key), unit: this.$route.params.unit }).then((data) => {
          if (data.length > 0) {
            console.log('1', data)
          }
        })
        objects.push({
          name: this.$t(`unit.data.type.${key}`) as string,
          exact: true,
          to: `/${this.$route.params.unit}/data/${key}/-/`,
          disabled: false,
          childItems: undefined,
          extended: true
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
          disabled: false
        }
      }))
    },
    capitalize(string: string): string {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    /**
     * Used to store the current ui settings in the local storage to reconstruct the layout on page reload.
     */
    persistUIState(persistentMenu?: boolean, dataCollapsed?: boolean, formsCollapsed?: boolean) {
      // fetch state from local storage
      let preferences = this.fetchUIState()

      // If the property doesn't exist, the state hasn't been stored yet so we create the initial one.
      if (preferences.persistentMenu === undefined) {
        preferences = { persistentMenu: false, dataCollapsed: false, formsCollapsed: false }
      }

      // Overwrite fetched state
      localStorage.setItem('veo-menu-preferences', JSON.stringify({
        persistentMenu: persistentMenu ?? preferences.persistentMenu,
        dataCollapsed: dataCollapsed ?? preferences.dataCollapsed,
        formsCollapsed: formsCollapsed ?? preferences.formsCollapsed
      }))
    },
    fetchUIState(): { persistentMenu?: boolean, dataCollapsed?: boolean, formsCollapsed?: boolean } {
      return JSON.parse(localStorage.getItem('veo-menu-preferences') || '{}')
    },
    persistSubmenuUIState(item: string, state: boolean) {
      if (item === 'veo.data') {
        this.persistUIState(undefined, state)
      } else if (item === 'veo.forms') {
        this.persistUIState(undefined, undefined, state)
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

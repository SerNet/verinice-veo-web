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
      <div
        class="d-flex flex-column fill-height">
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
import { PropType } from 'vue/types/options';
import { IVeoDomain } from '~/types/VeoTypes';
import LocalStorage from '~/util/LocalStorage';

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
    menuItems: {
      type: Array as PropType<INavItem[]>,
      default: () => []
    }
  },
  data() {
    return {
      miniVariant: LocalStorage.primaryNavMiniVariant,
      domains: [] as IVeoDomain[],
      objectTypes: [] as INavItem[],
      formTypes: [] as INavItem[],
      reportTypes: [] as INavItem[],
      catalogs: [] as INavItem[]
    };
  },
  computed: {
    items(): INavItem[] {
      return JSON.parse(JSON.stringify(this.menuItems));
    }
  },
  methods: {
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
    "noChildItems": "No sub items"
  },
  "de": {
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

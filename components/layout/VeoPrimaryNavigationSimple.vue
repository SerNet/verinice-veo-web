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
<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import VeoPrimaryNavigationBase from './VeoPrimaryNavigationBase.vue';

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

export default defineComponent({
  name: 'VeoPrimaryNavigation',
  extends: VeoPrimaryNavigationBase,
  props: {
    right: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: true
    },
    items: {
      type: Array as PropType<INavItem[]>,
      default: () => []
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

<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Annemarie Bufe, Samuel Vitzthum
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
  <v-spacer
    v-if="name === 'spacer'"
    class="mt-8"
  />
  <v-divider
    v-else-if="name === 'divider'"
    class="mt-8"
  />
  <v-skeleton-loader
    v-else-if="childItemsLoading"
    class="veo-primary-navigation__menu-item"
    :type="icon ? 'list-item-avatar' : 'list-item'"
  />
  <v-list-item
    v-else-if="childItems === undefined"
    class="flex-grow-0 flex-basis-auto veo-primary-navigation__menu-item"
    :to="to"
    :exact="exact === undefined || exact"
    active-class="primary--text"
  >
    <v-list-item-icon v-if="icon">
      <v-tooltip
        right
        :disabled="!miniVariant"
      >
        <template #activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
          >
            <v-icon
              v-text="icon"
            />
          </div>
        </template>
        <span>{{ name }}</span>
      </v-tooltip>
    </v-list-item-icon>
    <v-list-item-title>{{ name }}</v-list-item-title>
  </v-list-item>
  <v-list-group
    v-else
    :key="name"
    class="flex-grow-0 flex-auto veo-primary-navigation__menu-item"
    no-action
    color="black"
    :value="expanded"
    @click="onGroupClick"
  >
    <template #activator>
      <v-list-item-title>
        {{ name }}
      </v-list-item-title>
    </template>
    <template #prependIcon>
      <v-tooltip
        right
        :disabled="!miniVariant"
      >
        <template #activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
          >
            <v-icon
              color="rgba(0, 0, 0, 0.54)"
              v-text="icon"
            />
          </div>
        </template>
        <span>{{ name }}</span>
      </v-tooltip>
    </template>
    <v-list-item
      v-if="childItems.length === 0"
      style="min-height: 28px;"
      dense
    >
      <v-list-item-subtitle>{{ t('noEntries') }}</v-list-item-subtitle>
    </v-list-item>
    <VeoPrimaryNavigationEntry
      v-for="child of childItems"
      v-bind="child"
      :key="child.name"
      style="min-height: 28px;"
      :top-level-item="false"
      v-on="$listeners"
    />
  </v-list-group>
</template>

<script lang="ts">
import { RawLocation } from 'vue-router/types';
import { defineComponent, PropOptions, PropType } from '@nuxtjs/composition-api';
import { useI18n } from 'nuxt-i18n-composable';
import { INavItem } from './VeoPrimaryNavigation.vue';

export default defineComponent({
  name: 'VeoPrimaryNavigationEntry',
  props: {
    miniVariant: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      required: true
    },
    exact: {
      type: Boolean,
      default: undefined
    },
    icon: {
      type: String,
      default: undefined
    },
    to: {
      type: [String, Object],
      default: undefined
    } as PropOptions<RawLocation>,
    childItems: {
      type: Array as PropType<INavItem[]>,
      default: undefined
    },
    childItemsLoading: {
      type: Boolean,
      default: false
    },
    expanded: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    function onGroupClick() {
      if (props.miniVariant) {
        emit('expand-menu');
      }
    }

    return {
      onGroupClick,

      t
    };
  }
});
</script>

<i18n>
{
  "en": {
    "noEntries": "No entries"
  },
  "de": {
    "noEntries": "Keine Einträge"
  }
}
</i18n>

<style lang="scss">
.veo-primary-navigation__menu-item {
  flex-basis: auto;
}

.veo-primary-navigation__menu-item.v-list-group--no-action {
  & > .v-list-group__items {
    & > .v-list-item {
      padding-left: 76px !important;
    }
  }
}

.veo-primary-navigation__menu-item.v-skeleton-loader {
  margin-bottom: 4px;
  .v-skeleton-loader__list-item-avatar {
    height: 40px;
    padding: 0 8px;
    .v-skeleton-loader__avatar {
      width: 24px;
      height: 24px;
      margin-right: 32px;
    }
  }
  .v-skeleton-loader__list-item {
    height: 40px;
    padding: 0 8px;
    padding-left: 64px;
  }
}
</style>

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
    class="veo-primary-navigation__menu-item overflow-hidden"
    :type="icon ? 'list-item-avatar' : 'list-item'"
  />
  <v-list-item
    v-else-if="childItems === undefined"
    class="flex-grow-0 flex-basis-auto veo-primary-navigation__menu-item overflow-hidden"
    :class="{
      'pl-2': level === 0 || level === 1,
      'pl-8': level === 2
    }"
    :to="to"
    :exact="exact === undefined || exact"
    active-class="veo-primary-navigation-entry--active"
    :data-component-name="componentName"
  >
    <v-list-item-icon>
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
              color="black"
              v-text="icon"
            />
          </div>
        </template>
        <span>{{ name }}</span>
      </v-tooltip>
    </v-list-item-icon>
    <v-list-item-title>
      {{ name }}
    </v-list-item-title>
  </v-list-item>
  <v-list-group
    v-else
    :key="name"
    :value="groupIsExpanded"
    class="flex-grow-0 flex-auto veo-primary-navigation__menu-item overflow-hidden"
    color="black"
    no-action
    :data-component-name="componentName"
    @click="onGroupClick"
  >
    <template #activator>
      <v-list-item-title :class="{ 'font-weight-bold': partOfActivePath }">
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
              color="black"
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
      :level="level + 1"
      :path="currentPath"
      style="min-height: 28px;"
      v-on="$listeners"
    />
  </v-list-group>
</template>

<script lang="ts">
import { RawLocation } from 'vue-router/types';
import { computed, defineComponent, inject, PropOptions, PropType, ref, watch } from '@nuxtjs/composition-api';
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
    partOfActivePath: {
      type: Boolean,
      default: false
    },
    path: {
      type: String,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    componentName: {
      type: String,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();

    const expandedNavItems = inject<string[]>('expandedNavItems');
    const currentPath = computed(() => `${props.path}/${props.name}`);

    // Sadly a computed doesn't pick up the changes, so we have to manually update the ref
    const groupIsExpanded = ref((expandedNavItems && expandedNavItems.includes(currentPath.value)) || false);

    watch(
      () => expandedNavItems,
      () => {
        groupIsExpanded.value = (expandedNavItems && expandedNavItems.includes(currentPath.value)) || false;
      },
      {
        deep: true
      }
    );

    function onGroupClick() {
      if (props.miniVariant) {
        emit('expand-menu');
        return;
      }

      emit('collapse-other-submenus', currentPath.value);
    }

    return {
      currentPath,
      onGroupClick,
      groupIsExpanded,

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

<style lang="scss" scoped>
::v-deep.veo-primary-navigation__menu-item {
  flex-basis: auto;
}

::v-deep.veo-primary-navigation__menu-item.v-skeleton-loader {
  margin-bottom: 4px;
  .v-skeleton-loader__list-item-avatar {
    background: transparent;
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

::v-deep.v-list-item--active .v-list-item__title {
  font-weight: 700;
}

.veo-primary-navigation-entry--active,
.veo-primary-navigation-entry--active .v-icon {
  color: $primary !important;
}

.veo-primary-navigation-entry--active::before {
  background-color: $primary;
  opacity: 0.1;
}
</style>

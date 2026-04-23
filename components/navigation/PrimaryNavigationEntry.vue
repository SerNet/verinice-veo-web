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
  <template v-if="tooltip">
    <v-tooltip location="end" :aria-label="tooltip">
      <template #activator="{ props: tooltipProps }">
        <span v-bind="tooltipProps" :tabindex="disabled ? 0 : -1">
          <NavigationPrimaryNavigationEntryListItem
            v-bind="props"
            @open-parent="emit('open-parent')"
            @expand-menu="emit('expand-menu')"
          />
        </span>
      </template>
      <span>{{ tooltip }}</span>
    </v-tooltip>
  </template>
  <NavigationPrimaryNavigationEntryListItem
    v-else
    v-bind="props"
    @open-parent="emit('open-parent')"
    @expand-menu="emit('expand-menu')"
  />
</template>

<script setup lang="ts">
import { _RouteLocationBase } from 'vue-router';
import type { INavItem } from './PrimaryNavigation.vue';

const props = withDefaults(
  defineProps<
    INavItem & {
      level?: number;
      miniVariant: boolean;
      badge?: { content: number; color: string; classes?: string };
      tooltip?: string;
      disabled?: boolean;
    }
  >(),
  {
    level: 0,
    icon: undefined,
    to: undefined,
    exact: false,
    componentName: undefined,
    classes: undefined,
    children: undefined,
    openInNewtab: false,
    badge: undefined,
    tooltip: undefined,
    disabled: false
  }
);

const emit = defineEmits<{
  (event: 'expand-menu' | 'open-parent'): void;
}>();
</script>

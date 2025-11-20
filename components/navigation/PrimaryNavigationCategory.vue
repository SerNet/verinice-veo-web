<!--
   - verinice.veo web
   - Copyright (C) 2022  Jonas Heitmann
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
  <v-list-group
    :sub-group="level > 0"
    :data-component-name="componentName"
    :data-veo-test="`nav-group-${name?.toLowerCase()}`"
    active-class="veo-active-list-nav-item"
    :class="[{ 'border-top': level === 0 }, 'veo-list-nav-item']"
    :target="openInNewtab ? '_blank' : undefined"
    :value="id"
    :aria-label="`Expand ${name}`"
    role="group"
    @click.stop="onClick"
  >
    <!-- @vue-ignore TODO #3066 does not exist -->
    <template #prependIcon>
      <v-icon v-if="level > 0" :icon="mdiChevronDown" />
      <v-icon v-else-if="icon" :icon="icon" />
    </template>
    <template #activator="{ props: activatorProps }">
      <v-list-item
        v-bind="activatorProps"
        :density="level > 0 ? 'compact' : 'default'"
        :class="activatorIntendation"
        tabindex="0"
        role="menuitem"
        :aria-selected="undefined"
        @click="emit('expand-menu')"
      >
        <template #prepend>
          <v-tooltip location="end" :disabled="!miniVariant" :aria-label="`${name}`">
            <template #activator="{ props: tooltip }">
              <div v-bind="tooltip">
                <v-icon v-if="icon" :icon="icon" class="mr-3" />
              </div>
            </template>
            <span>{{ name }}</span>
          </v-tooltip>
        </template>
        <template #default="{ isActive }">
          <v-list-item-title
            class="veo-primary-navigation-title"
            :class="{ 'font-weight-bold': isActive }"
            data-veo-test="nav-category-title"
          >
            {{ name }}
          </v-list-item-title>
        </template>
      </v-list-item>
    </template>
    <template v-if="childrenLoading">
      <v-list-item v-for="index in 3" :key="index" disabled>
        <v-list-item-title>
          <v-skeleton-loader data-veo-test="loader" type="text" width="100%" />
        </v-list-item-title>
      </v-list-item>
    </template>
    <template v-else>
      <template v-for="child of children" :key="child.id">
        <NavigationPrimaryNavigationEntry
          v-if="!child.children"
          v-bind="child"
          :level="level + 1"
          :mini-variant="miniVariant"
          :data-veo-test="`nav-entry-${name?.toLowerCase().replace(/\s+/g, '-')}-${child.name?.toLowerCase().replace(/\s+/g, '-')}`"
          @expand-menu="emit('expand-menu')"
          @open-parent="openCategory"
        />
        <NavigationPrimaryNavigationCategory
          v-else
          v-bind="child"
          :level="level + 1"
          :mini-variant="miniVariant"
          :data-veo-test="`nav-category-${name?.toLowerCase().replace(/\s+/g, '-')}-${child.name?.toLowerCase().replace(/\s+/g, '-')}`"
          @expand-menu="emit('expand-menu')"
        />
      </template>
    </template>
  </v-list-group>
</template>

<script setup lang="ts">
import { mdiChevronDown } from '@mdi/js';
import type { VList } from 'vuetify/components';

import type { INavItem } from './PrimaryNavigation.vue';
import { PROVIDE_KEYS as PRIMARY_NAVIGATION_KEYS } from './PrimaryNavigation.vue';

const props = withDefaults(
  defineProps<
    INavItem & {
      level?: number;
      miniVariant: boolean;
    }
  >(),
  {
    icon: undefined,
    to: undefined,
    exact: false,
    componentName: undefined,
    classes: undefined,
    level: 0,
    children: undefined,
    openInNewtab: false
  }
);

const emit = defineEmits<{
  (event: 'expand-menu' | 'click'): void;
}>();

const route = useRoute();
const router = useRouter();

const navigation = inject<Ref<VList>>(PRIMARY_NAVIGATION_KEYS.navigation);

const onClick = () => {
  if (props.openInNewtab) {
    return;
  }
  if (props.miniVariant) {
    emit('expand-menu');
  }
  if (props.to && route.path !== props.to) {
    router.push(props.to);
  }
};

const activatorIntendation = computed(() => `primary-navigation-entry-level-${props.level}`);

const openCategory = () => {
  navigation?.value.open(props.id, true);
};
</script>

<style lang="scss" scoped>
@use 'assets/styles/_variables.scss';

.border-top {
  border-top: 1px solid variables.$medium-grey;
}

.v-list-item--density-compact.primary-navigation-entry-level-1 {
  padding-inline-start: 52px !important;
}

.v-list-item--density-compact.primary-navigation-entry-level-2 {
  padding-inline-start: 84px !important;
}

.v-list-item--density-compact.primary-navigation-entry-level-3 {
  padding-inline-start: 116px !important;
}

.veo-list-nav-item {
  border-left: 4px solid transparent;
}

.veo-active-list-nav-item {
  border-left: 4px solid variables.$primary;
}
</style>

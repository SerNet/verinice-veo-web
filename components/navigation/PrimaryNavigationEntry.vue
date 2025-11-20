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
  <v-list-item
    :to="to"
    :active="active"
    active-class="veo-active-list-nav-item"
    class="veo-list-nav-item"
    color="color"
    :class="_classes"
    :data-component-name="componentName"
    :data-veo-test="componentName"
    density="compact"
    :target="openInNewtab ? '_blank' : undefined"
    tabindex="0"
    autofocus
    role="menuitem"
    @click.stop="onClick"
  >
    <template v-if="icon" #prepend>
      <v-tooltip location="end" :disabled="!miniVariant" :aria-label="`${name}`">
        <template #activator="{ props: tooltip }">
          <div v-bind="tooltip">
            <v-icon v-if="icon" :icon="icon" start />
          </div>
        </template>
        <span>{{ name }}</span>
      </v-tooltip>
    </template>
    <v-list-item-title class="veo-primary-navigation-title" data-veo-test="nav-entry-title">
      {{ name }}
    </v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
import { _RouteLocationBase } from 'vue-router';

import type { INavItem } from './PrimaryNavigation.vue';

const props = withDefaults(
  defineProps<
    INavItem & {
      level: number;
      miniVariant: boolean;
    }
  >(),
  {
    icon: undefined,
    to: undefined,
    exact: false,
    componentName: undefined,
    classes: undefined,
    children: undefined,
    openInNewtab: false
  }
);

const emit = defineEmits<{
  (event: 'expand-menu' | 'open-parent'): void;
}>();

const router = useRouter();
const route = useRoute();

/* The default match function of the router watches for the same resolved route name, however this means that
 * /<unit>/domains/<objectType>/<subType> won't match /<unit>/domains/<objectType>/<subType>/<object> and thus the menu
 * entry won't be highlighted even if we set exact to false, so we need to implement our own match function.
 */
const active = computed(() => {
  if (!props.to) {
    return false;
  }

  const resolvedRoute = router.resolve(props.to);
  return props.exact ? resolvedRoute.fullPath === route.fullPath : route.fullPath.startsWith(resolvedRoute.fullPath);
});

// For some reason the list doesn't get auto-openend if an object is opened even though active is true (probably because the nav item isn't the full path, so we have to do it by ourselves)
watch(
  () => active.value,
  (newValue) => {
    if (newValue) {
      emit('open-parent');
    }
  },
  { immediate: true }
);

const onClick = () => {
  if (props.openInNewtab) {
    return;
  }
  if (props.miniVariant) {
    emit('expand-menu');
  }
};
const _classes = computed(() => `${props.classes} primary-navigation-entry-level-${props.level}`);
</script>

<style lang="scss">
@use 'assets/styles/_variables.scss';

.veo-list-nav-item {
  border-left: 4px solid transparent;
}

.veo-active-list-nav-item {
  border-left: 4px solid variables.$primary;
}
</style>

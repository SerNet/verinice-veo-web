<!--
   - verinice.veo web
   - Copyright (C) 2026 jae
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
    :to="disabled ? undefined : to"
    :disabled="disabled"
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
    @click="onClick"
  >
    <template v-if="icon" #prepend>
      <div>
        <v-icon :icon="icon" start />
      </div>
    </template>
    <v-list-item-title class="veo-primary-navigation-title" data-veo-test="nav-entry-title">
      {{ name }}
    </v-list-item-title>
    <template v-if="badge" #append>
      <v-badge location="top" :color="badge.color" :content="badge.content" class="pb-1 px-4" />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import type { INavItem } from './PrimaryNavigation.vue';

type Props = INavItem & {
  level: number;
  miniVariant?: boolean;
  badge?: { content: number; color: string; classes?: string };
  disabled?: boolean;
};

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'expand-menu' | 'open-parent'): void;
}>();

const router = useRouter();
const route = useRoute();

const _classes = computed(() => `${props.classes} primary-navigation-entry-level-${props.level}`);

const active = computed(() => {
  if (!props.to) {
    return false;
  }

  const resolvedRoute = router.resolve(props.to);
  return props.exact ? resolvedRoute.fullPath === route.fullPath : route.fullPath.startsWith(resolvedRoute.fullPath);
});

watch(
  () => active.value,
  (newValue) => {
    if (newValue) {
      emit('open-parent');
    }
  },
  { immediate: true }
);

function onClick() {
  if (props.openInNewtab) {
    return;
  }
  if (props.miniVariant) {
    emit('expand-menu');
  }
}
</script>

<style lang="scss">
@use 'assets/styles/_variables.scss';

.veo-list-nav-item {
  border-left: 4px solid transparent;
}

.veo-active-list-nav-item {
  border-left: 4px solid variables.$primary;
}

.v-list-item--density-compact.v-list-item--one-line:not(.v-list-item--nav) {
  padding-inline: 10px;
}
</style>

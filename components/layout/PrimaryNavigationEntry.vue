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
    active-color="primary"
    :class="_classes"
    :data-component-name="componentName"
    density="compact"
    :target="openInNewtab ? '_blank' : ''"
    @click.stop="onClick"
  >
    <template
      v-if="icon || faIcon"
      #prepend
    >
      <v-tooltip
        location="end"
        :disabled="!miniVariant"
      >
        <template #activator="{ props: tooltip }">
          <div v-bind="tooltip">
            <v-icon
              v-if="icon"
              :icon="icon"
              start
            />
            <font-awesome-icon
              v-else-if="faIcon"
              :icon="faIcon"
            />
          </div>
        </template>
        <span>{{ name }}</span>
      </v-tooltip>
    </template>
    <v-list-item-title class="veo-primary-navigation-title">
      {{ name }}
    </v-list-item-title>
  </v-list-item>
</template>

<script lang="ts" setup>
import { _RouteLocationBase } from 'vue-router';
import { INavItem } from './PrimaryNavigation.vue';

const props = withDefaults(defineProps<{
  name: string;
  icon?: string;
  faIcon?: string | string[];
  to?: _RouteLocationBase;
  exact?: boolean;
  miniVariant?: boolean;
  componentName?: string;
  classes?: string;
  level?: number;
  children?: INavItem[];
  openInNewtab?: boolean;
}>(), {
  name: '',
  icon: undefined,
  faIcon: undefined,
  to: undefined,
  exact: false,
  miniVariant: false,
  componentName: undefined,
  classes: undefined,
  level: 0,
  children: () => [],
  openInNewtab: false
});

const emit = defineEmits(['expand-menu', 'click']);

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

const onClick = () => {
  if(props.openInNewtab) {
    return;
  }
  if (props.miniVariant) {
    emit('expand-menu');
  }
};
const _classes = computed(() => `${props.classes} primary-navigation-entry-level-${props.level}`);
</script>

<style lang="scss">
.veo-active-list-nav-item {
  border-left: 4px solid $primary;
}
</style>

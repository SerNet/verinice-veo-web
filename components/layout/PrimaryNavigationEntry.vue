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
    :active="isActive"
    active-class="veo-active-list-item veo-active-list-nav-item"
    :class="_classes"
    :data-component-name="componentName"
    density="compact"
    :target="$props.openInNewtab ? '_blank' : ''"
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
        <template #activator="{ props: tooltip, attrs }">
          <div
            v-bind="mergeProps(attrs, tooltip)"
          >
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

<script setup lang="ts">
import { isEqual, pick } from 'lodash';
import { mergeProps, PropType } from 'vue';
import { _RouteLocationBase } from 'vue-router';
import { INavItem } from './PrimaryNavigation.vue';

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: undefined
  },
  faIcon: {
    type: [String, Array],
    default: undefined
  },
  to: {
    type: [String, Object] as PropType<_RouteLocationBase>,
    required: true
  },
  exact: {
    type: Boolean,
    default: false
  },
  miniVariant: {
    type: Boolean,
    default: false
  },
  componentName: {
    type: String,
    default: undefined
  },
  classes: {
    type: String,
    default: undefined
  },
  level: {
    type: Number,
    default: 0
  },
  activePath: {
    type: String,
    default: undefined
  },
  children: {
    type: Array as PropType<INavItem[]>,
    default: () => []
  },
  openInNewtab: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['expand-menu', 'click']);

const route = useRoute();
  
const onClick = () => {
  if(props.openInNewtab) {
    return;
  }
  if (props.miniVariant) {
    emit('expand-menu');
  }
  navigateTo(props.to);
};
const _classes = computed(() => `${props.classes} primary-navigation-entry-level-${props.level}`);

const isActive = computed(() => {
  const isRouteObject = typeof props.to === 'object';

  if(props.activePath) {
    return props.exact ? route.fullPath === props.activePath : route.fullPath.includes(props.activePath);
  } else if(isRouteObject) {
    const toRoute = props.to as _RouteLocationBase;
    // Set defaults to make comparing route objects easier
    if(!toRoute.query) {
      toRoute.query = {};
    }
    if(!toRoute.params) {
      toRoute.params = {};
    }
    return props.exact ? isEqual(pick(route, 'name', 'query', 'params'), pick(toRoute, 'name', 'query', 'params')) : route.name?.toString().includes(toRoute.name?.toString() || '');
  } else {
    return props.exact ? route.fullPath === props.to : route.fullPath.includes(props.to);
  }
});
</script>

<style lang="scss">
.veo-active-list-nav-item {
  border-left: 4px solid $primary;
}
</style>

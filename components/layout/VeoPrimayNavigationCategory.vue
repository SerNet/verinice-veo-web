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
    active-class="black--text font-weight-bold"
    :sub-group="level > 0"
    :data-component-name="componentName"
    :prepend-icon="level > 0 ? mdiChevronDown : icon"
    :class="{ 'border-top': level === 0, 'veo-primary-navigation__group': level > 0, 'veo-primary-navigation__group--active': $route.fullPath.includes(activePath) }"
    no-action
    :value="$route.fullPath.includes(activePath) /* group prop is not working with query parameters, so we have to use a simple hack to expand the active path */"
    @click="onClick"
  >
    <template #activator>
      <v-list-item-icon v-if="icon && level > 0">
        <v-icon>
          {{ icon }}
        </v-icon>
      </v-list-item-icon>
      <v-list-item-title class="veo-primary-navigation__group__title">
        {{ name }}
      </v-list-item-title>
    </template>
    <template v-if="childrenLoading">
      <v-list-item
        v-for="index in 3"
        :key="index"
        disabled
      >
        <v-list-item-title>
          <v-skeleton-loader
            type="text"
            width="100%"
          />
        </v-list-item-title>
      </v-list-item>
    </template>
    <template v-else>
      <template v-for="child of children">
        <div :key="child.key">
          <VeoPrimaryNavigationEntry
            v-if="!child.children"
            v-bind="child"
            v-on="$listeners"
          />
          <VeoPrimaryNavigationCategory
            v-else
            v-bind="child"
            :level="level + 1"
            v-on="$listeners"
          />
        </div>
      </template>
    </template>
  </v-list-group>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';
import { mdiChevronDown } from '@mdi/js';

import { INavItem } from './VeoPrimaryNavigation.vue';

export default defineComponent({
  name: 'VeoPrimaryNavigationCategory',
  props: {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: undefined
    },
    children: {
      type: Array as PropType<INavItem[]>,
      required: true
    },
    childrenLoading: {
      type: Boolean,
      default: false
    },
    miniVariant: {
      type: Boolean,
      default: false
    },
    level: {
      type: Number,
      default: 0
    },
    activePath: {
      type: String,
      required: true
    },
    componentName: {
      type: String,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const onClick = (event: any) => {
      if (props.miniVariant) {
        emit('expand-menu');
      }
      emit('click', event);
    };

    return {
      onClick,

      mdiChevronDown
    };
  }
});
</script>

<style lang="scss" scoped>
.border-top {
  border-top: 1px solid $medium-grey;
}

.veo-primary-navigation__group > ::v-deep.v-list-group__header {
  min-height: 32px;
  max-height: 32px;

  > .v-list-item__icon {
    margin-bottom: 4px;
    margin-top: 4px;
  }
}

.veo-primary-navigation__group > ::v-deep.v-list-group__header.v-list-item--active,
.veo-primary-navigation__group--active > ::v-deep.v-list-group__header {
  color: #000000;
  font-weight: bold;
}

.veo-primary-navigation__group__title {
  font-size: 0.8125rem;
  line-height: 1rem;
}
</style>

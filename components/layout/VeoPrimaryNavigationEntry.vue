<!--
   - verinice.veo web
   - Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
  <v-list-item
    v-else-if="childItems === undefined"
    class="flex-grow-0 flex-basis-auto veo-primary-navigation__menu-item"
    :to="to"
    :exact="exact"
    :disabled="disabled"
    active-class="veo-active-link-item"
  >
    <v-list-item-icon v-if="icon">
      <v-tooltip
        right
        :disabled="!miniVariant || false"
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
    :value="expanded"
    no-action
    active-class="veo-active-link-group"
    :sub-group="!topLevelItem"
    @input="onInputExpanded"
  >
    <template #activator>
      <v-list-item-title>
        {{ name }}
      </v-list-item-title>
    </template>
    <template #prependIcon>
      <v-tooltip
        right
        :disabled="!miniVariant || false"
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
    </template>
    <VeoPrimaryNavigationEntry
      v-for="child of childItems"
      :key="child.name"
      v-bind="child"
      :persist-u-i-state="child.persistCollapsedState"
    />
  </v-list-group>
</template>

<script lang="ts">
import { defineComponent, PropType, Ref, ref, watch } from '@nuxtjs/composition-api';
import { INavItem } from './VeoPrimaryNavigation.vue';

interface IProps extends INavItem {
  persistUIState: Function;
  miniVariant: boolean;
}

export default defineComponent<IProps>({
  name: 'VeoPrimaryNavigationEntry',
  props: {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: undefined
    },
    to: {
      type: String,
      default: undefined
    },
    exact: {
      type: Boolean,
      default: undefined
    },
    disabled: {
      type: Boolean,
      required: true
    },
    childItems: {
      type: Array as PropType<INavItem[]>,
      default: undefined
    },
    collapsed: {
      type: Boolean,
      default: false
    },
    miniVariant: {
      type: Boolean
    },
    topLevelItem: {
      type: Boolean,
      required: true
    },
    persistUIState: {
      type: Function,
      default: undefined
    }
  },
  setup(props, context) {
    const expanded: Ref<boolean | undefined> = ref(!props.collapsed);

    watch(
      () => props.collapsed,
      (newValue: boolean | undefined) => {
        if (expanded.value !== !newValue) {
          expanded.value = !newValue;
        }
      }
    );

    function emitCollapsed(newExpandedVal: boolean | undefined) {
      context.emit('update:collapsed', !newExpandedVal);
      props.persistUIState?.(!newExpandedVal);
    }

    function onInputExpanded(newExpandedVal: boolean | undefined) {
      // Set local expanded variable to new value
      expanded.value = newExpandedVal;
      // Create a special behavior, when minivariant is active
      if (props.miniVariant) {
        // If new state of a list group is not expanded (false),
        // but after clicking expansion panel it should be in minivariant it should be opened
        // therefore hack it with $nextTick to force expansion
        if (!expanded.value) {
          context.root.$nextTick(() => {
            expanded.value = true;
            emitCollapsed(expanded.value);
            context.emit('update-mini-variant', false);
          });
        } else {
          // If a new state of the group is expanded (true), then no need for hack
          emitCollapsed(expanded.value);
          context.emit('update-mini-variant', false);
        }
      } else {
        emitCollapsed(expanded.value);
      }
    }

    return { expanded, onInputExpanded };
  }
});
</script>

<style lang="scss" scoped>
.veo-primary-navigation__menu-item {
  flex-basis: auto;
}
</style>

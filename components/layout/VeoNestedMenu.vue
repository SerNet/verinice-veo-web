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
  <v-menu
    v-model="menu"
    v-bind="$props"
  >
    <template
      v-if="!!$scopedSlots.activator"
      #activator="slotListeners"
    >
      <slot
        name="activator"
        v-bind="slotListeners"
      />
    </template>
    <template #default>
      <v-list dense>
        <template v-for="item of items">
          <VeoNestedMenu
            v-if="item.children && item.children.length"
            :key="item.key"
            :items="item.children"
            open-on-hover
            right
            offset-x
            :bottom="false"
            :offset-y="false"
            @close="onCloseMenu"
          >
            <template #activator="{ on }">
              <v-list-item
                :key="item.key"
                v-on="on"
              >
                <v-list-item-icon v-if="anyItemHasIcon">
                  <v-icon v-if="item.icon">
                    {{ item.icon }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-title>
                  {{ item.title }}
                </v-list-item-title>

                <v-list-item-icon v-if="item.children && item.children.length">
                  <v-icon>
                    {{ mdiChevronRight }}
                  </v-icon>
                </v-list-item-icon>
              </v-list-item>
            </template>
          </VeoNestedMenu>
          <v-list-item
            v-else
            :key="item.key"
            @click="onActionClicked(item.action)"
          >
            <v-list-item-icon v-if="anyItemHasIcon">
              <v-icon v-if="item.icon">
                {{ item.icon }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
            <v-list-item-icon v-if="anyItemHasChildren" />
          </v-list-item>
        </template>
      </v-list>
    </template>
  </v-menu>
</template>

<script lang="ts">
import { computed, defineComponent, PropOptions, ref } from '@nuxtjs/composition-api';
import { mdiChevronRight } from '@mdi/js';

import { IVeoNestedMenuEntries } from '~/types/VeoTypes';

export default defineComponent({
  props: {
    items: {
      type: Array,
      default: () => []
    } as PropOptions<IVeoNestedMenuEntries[]>,
    closeOnContentClick: {
      type: Boolean,
      default: false
    },
    offsetX: {
      type: Boolean,
      default: false
    },
    offsetY: {
      type: Boolean,
      default: true
    },
    bottom: {
      type: Boolean,
      default: true
    },
    right: {
      type: Boolean,
      default: false
    },
    openOnHover: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const anyItemHasIcon = computed(() => (props.items || []).some((item) => !!item.icon));

    const anyItemHasChildren = computed(() => (props.items || []).some((item) => !!item.children));

    const menu = ref(false);

    const onActionClicked = (action: CallableFunction) => {
      action();
      // Closing this menu and emitting an event to close the parent menu if it exists (onContentClick is false, as we don't want to close the menu if the user clicks on a menu entry containing a submenu)
      onCloseMenu();
    };

    const onCloseMenu = () => {
      menu.value = false;
      emit('close');
    };

    return {
      anyItemHasChildren,
      anyItemHasIcon,
      menu,
      onActionClicked,
      onCloseMenu,

      mdiChevronRight
    };
  }
});
</script>

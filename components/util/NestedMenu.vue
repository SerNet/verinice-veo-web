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
    v-bind="$attrs"
  >
    <template
      v-if="!!$slots.activator"
      #activator="slotListeners"
    >
      <slot
        name="activator"
        v-bind="slotListeners"
      />
    </template>
    <template #default>
      <v-list density="compact">
        <template v-for="item of items">
          <UtilNestedMenu
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
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                :key="`0_${item.key}`"
              >
                <template
                  v-if="anyItemHasIcon"
                  #prepend
                >
                  <v-icon
                    v-if="item.icon"
                    :icon="item.icon"
                  />
                </template>
                <v-list-item-title>
                  {{ item.title }}
                </v-list-item-title>
                <template
                  v-if="item.children && item.children.length"
                  #append
                >
                  <v-icon :icon="mdiChevronRight" />
                </template>
              </v-list-item>
            </template>
          </UtilNestedMenu>
          <v-list-item
            v-else
            :key="`1_${item.key}`"
            @click="item.action ? onActionClicked(item.action) : () => {}"
          >
            <template
              v-if="anyItemHasIcon"
              #prepend
            >
              <v-icon
                v-if="item.icon"
                :icon="item.icon"
              />
            </template>
            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </template>
  </v-menu>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { mdiChevronRight } from '@mdi/js';
import { ComposerTranslation } from 'vue-i18n';

export interface INestedMenuEntries {
  key: string;
  title: string | ComposerTranslation;
  icon?: string;
  action?: CallableFunction;
  children?: INestedMenuEntries[];
}

export default defineComponent({
  props: {
    items: {
      type: Array as PropType<INestedMenuEntries[]>,
      default: () => []
    }
  },
  emits: ['close'],
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

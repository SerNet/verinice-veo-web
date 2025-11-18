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
  <v-menu v-model="menu" v-bind="$attrs" :close-on-content-click="false">
    <template v-if="!!$slots.activator" #activator="slotListeners">
      <slot name="activator" v-bind="slotListeners"></slot>
    </template>
    <template #default>
      <v-list density="compact">
        <template v-for="item of items">
          <UtilNestedMenu
            v-if="item.children && item.children.length"
            :key="item.key"
            :items="item.children"
            open-on-hover
            location="right"
            @close="closeMenu"
          >
            <template #activator="{ props: activatorProps }">
              <v-list-item
                v-bind="activatorProps"
                :key="`0_${item.key}`"
                data-veo-test="action-selection-nav-item"
                @click.stop="() => {}"
              >
                <template v-if="anyItemHasIcon" #prepend>
                  <v-icon v-if="item.icon" :icon="item.icon" :color="item.color" />
                  <div v-else style="width: 54px"></div>
                </template>
                <v-list-item-title :class="{ [`text-${item.color}`]: !!item.color }">
                  {{ item.title }}
                </v-list-item-title>
                <template #append>
                  <v-icon :icon="mdiChevronRight" />
                </template>
              </v-list-item>
            </template>
          </UtilNestedMenu>
          <v-list-item
            v-else
            :key="`1_${item.key}`"
            data-veo-test="action-selection-nav-item"
            @click="onItemClicked(`1_${item.key}`, item)"
          >
            <template v-if="anyItemHasIcon" #prepend>
              <v-icon v-if="item.icon" :icon="item.icon" :color="item.color" />
              <div v-else style="width: 54px"></div>
            </template>
            <v-list-item-title :class="{ [`text-${item.color}`]: !!item.color }">
              {{ item.title }}
            </v-list-item-title>
            <component
              :is="item.component"
              v-if="item.component"
              v-bind="item.componentProps"
              :model-value="!!componentIsVisible[`1_${item.key}`]"
              @update:model-value="onUpdateComponentModelValue(`1_${item.key}`, $event)"
            />
            <template v-if="anyItemHasChildren" #append>
              <div style="width: 54px"></div>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </template>
  </v-menu>
</template>

<script setup lang="ts">
import { mdiChevronRight } from '@mdi/js';
import type { ComposerTranslation } from 'vue-i18n';

export interface INestedMenuEntries {
  key: string;
  title: string | ComposerTranslation;
  icon?: string;
  subType?: string;
  component?: any;
  componentProps?: Record<string, any>;
  callback?: (item?: INestedMenuEntries) => void;
  children?: INestedMenuEntries[];
  color?: string;
}
const props = withDefaults(
  defineProps<{
    items: INestedMenuEntries[];
  }>(),
  {
    items: () => []
  }
);

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const anyItemHasIcon = computed(() => (props.items || []).some((item) => !!item.icon));

const anyItemHasChildren = computed(() => (props.items || []).some((item) => !!item.children));

const menu = ref(false);

const componentIsVisible = ref<Record<string, boolean>>({});

const onItemClicked = (itemKey: string, item: INestedMenuEntries) => {
  if (item.component) {
    componentIsVisible.value[itemKey] = true;
  }
  if (item.callback) {
    item.callback(item);
    closeMenu();
  }
};

const onUpdateComponentModelValue = (itemKey: string, newValue: boolean) => {
  if (itemKey) {
    componentIsVisible.value[itemKey] = newValue;
  }

  if (!newValue) {
    closeMenu();
  }
};

const closeMenu = () => {
  menu.value = false;
  emit('close');
};
</script>

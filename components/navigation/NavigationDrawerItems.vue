<!--
   - verinice.veo web
   - Copyright (C) 2026  Djordje Mirosavljevic
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
  <div v-if="miniVariant && !xs" key="mini">
    <v-menu
      v-if="item.children && item.children.length > 0"
      v-model="isSubMenuOpen"
      location="right"
      offset="18"
      :close-delay="50"
    >
      <template #activator="{ props: menuProps }">
        <v-tooltip :text="item.name" location="right" offset="10">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="mergeProps(menuProps, tooltipProps)"
              :aria-label="item.name"
              aria-haspopup="true"
              :aria-expanded="isSubMenuOpen"
              :class="['mb-2 rounded-lg mx-auto d-flex', { 'text-primary': isItemSelected }]"
              :style="{ width: '44px', height: '44px' }"
              variant="text"
              icon
            >
              <v-icon :icon="item.icon" size="22" aria-hidden="true" />
            </v-btn>
          </template>
        </v-tooltip>
      </template>

      <v-card min-width="220" elevation="12" class="border pa-1 bg-surface shadow-xl">
        <v-list density="compact" class="py-0" :aria-label="item.name">
          <template v-for="child in item.children" :key="child.id">
            <NavigationPrimaryNavigationCategory v-if="child.children" v-bind="child" :mini-variant="false" />
            <NavigationPrimaryNavigationEntry
              v-else
              v-bind="child"
              :mini-variant="false"
              @click="isSubMenuOpen = false"
            />
          </template>
        </v-list>
      </v-card>
    </v-menu>

    <v-tooltip v-else :text="item.name" location="right" offset="10">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          :to="item.to"
          :aria-label="item.name"
          :aria-current="isItemSelected ? 'page' : undefined"
          :class="['mb-2 rounded-lg mx-auto d-flex', { 'text-primary': isItemSelected }]"
          :style="{ width: '44px', height: '44px' }"
          variant="text"
          icon
        >
          <v-icon :icon="item.icon" size="22" aria-hidden="true" />
        </v-btn>
      </template>
    </v-tooltip>
  </div>

  <div v-else key="expanded">
    <NavigationPrimaryNavigationCategory v-if="item.children" v-bind="item" :mini-variant="false" />
    <NavigationPrimaryNavigationEntry v-else v-bind="item" :mini-variant="false" />
  </div>
</template>

<script setup lang="ts">
import { mergeProps } from 'vue';
import { useDisplay } from 'vuetify';
import { useRoute } from 'vue-router';

const props = defineProps<{
  item: any;
  miniVariant: boolean;
}>();

const { xs } = useDisplay();
const route = useRoute();
const isSubMenuOpen = ref(false);

watch(
  () => route.path,
  () => {
    isSubMenuOpen.value = false;
  }
);

const isItemSelected = computed(() => {
  const parentMaps: Record<string, string> = {
    objects: 'objectType',
    catalog: 'catalog',
    risks: 'risks'
  };
  const target = parentMaps[props.item.id];
  const routeName = route.name?.toString() || '';
  if (props.item.to?.name === route.name) return true;
  return !!(target && routeName.includes(target));
});
</script>

<template>
  <div v-if="miniVariant && !xs" key="mini" role="menu">
    <v-menu
      v-if="item.children && item.children.length > 0"
      location="left"
      :open-on-hover="false"
      :close-on-content-click="false"
      offset="18"
      transition="slide-x-transition"
    >
      <template #activator="{ props: menuProps }">
        <v-tooltip :text="item.name" location="left" offset="10">
          <template #activator="{ props: tooltipProps }">
            <v-list-item
              v-bind="mergeProps(menuProps, tooltipProps)"
              variant="text"
              class="d-flex justify-center rounded-lg mx-auto"
              :style="{ width: '44px', height: '44px' }"
              :aria-label="item.name"
              aria-haspopup="menu"
              role="menuitem"
            >
              <div class="d-flex align-center justify-center w-100 h-100" aria-hidden="true">
                <v-icon :icon="item.icon" size="22" />
              </div>
            </v-list-item>
          </template>
        </v-tooltip>
      </template>

      <v-card min-width="220" elevation="12" class="border pa-1 bg-surface shadow-xl">
        <v-list density="compact" class="py-0" role="menu" :aria-label="item.name">
          <template v-for="child in item.children" :key="child.id">
            <NavigationPrimaryNavigationCategory v-if="child.children" v-bind="child" :mini-variant="false" />
            <NavigationPrimaryNavigationEntry v-else v-bind="child" :mini-variant="false" />
          </template>
        </v-list>
      </v-card>
    </v-menu>

    <v-tooltip v-else :text="item.name" location="left" offset="10">
      <template #activator="{ props: tooltipProps }">
        <v-list-item
          v-bind="tooltipProps"
          :to="item.to"
          link
          variant="text"
          class="mb-2 d-flex justify-center rounded-lg mx-auto"
          :style="{ width: '44px', height: '44px' }"
          :aria-label="item.name"
          role="menuitem"
        >
          <div class="d-flex align-center justify-center w-100 h-100" aria-hidden="true">
            <v-icon :icon="item.icon" size="22" />
          </div>
        </v-list-item>
      </template>
    </v-tooltip>
  </div>

  <div v-else key="expanded" role="group">
    <NavigationPrimaryNavigationCategory v-if="item.children" v-bind="item" :mini-variant="false" />
    <NavigationPrimaryNavigationEntry v-else v-bind="item" :mini-variant="false" />
  </div>
</template>

<script setup lang="ts">
import { mergeProps } from 'vue';
import { useDisplay } from 'vuetify/framework';

const { xs } = useDisplay();

defineProps<{
  item: any;
  miniVariant: boolean;
}>();
</script>

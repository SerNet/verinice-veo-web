<!--
   - verinice.veo web
   - Copyright (C) 2025 Aziz Khalledi
   - 
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <div>
    <BaseDialog
      :model-value="props.modelValue"
      :title="t('title')"
      large
      fixed-footer
      @close="closeDialog"
      @update:model-value="handleModelUpdate"
    >
      <template #default>
        <v-container class="shortcut-dialog-container">
          <header>
            <!-- Dialog Header -->
            <v-row class="mb-2">
              <v-col cols="12">
                <div class="text-body-2 font-weight-bold">
                  {{ t('openInstructions', { shortcut: '' }) }}
                  <ShortcutsItem :shortcut="SHORTCUT_DIALOG_DISPLAY" show-tooltips compact-keys />
                </div>
              </v-col>
            </v-row>
          </header>

          <main>
            <!-- Main Content -->
            <v-row>
              <!-- Domain Navigation Shortcuts -->
              <v-col v-if="domainNavigationShortcuts.length > 0" cols="12" :md="columnWidth">
                <v-card flat>
                  <v-card-title class="text-subtitle-2 py-2">{{ t('domainNavigation') }}</v-card-title>
                  <v-divider></v-divider>
                  <v-list density="compact" class="shortcut-list">
                    <v-list-item v-for="action in domainNavigationShortcuts" :key="action.id" class="text-body-2">
                      <v-list-item-title class="text-body-2">
                        {{ action.name }}
                      </v-list-item-title>
                      <v-list-item-subtitle v-if="action.description" class="text-caption">
                        {{ action.description }}
                      </v-list-item-subtitle>
                      <template #append>
                        <ShortcutsItem :shortcut="action.keys" :show-tooltips="true" compact-keys />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>

              <!-- No shortcuts available message -->
              <v-col v-if="!props.hasAnyShortcuts" cols="12" class="text-center">
                <h3 class="text-h6 mb-2 text-medium-emphasis">
                  {{ t('noShortcuts') }}
                </h3>
              </v-col>
            </v-row>
          </main>
        </v-container>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import {
  CATEGORY_DOMAIN_NAVIGATION,
  SHORTCUT_DIALOG_DISPLAY,
  type ShortcutAction,
  type ShortcutGroup
} from '~/composables/shortcuts/types';

const { t } = useI18n();

// ============================
// PROPS & EMITS
// ============================

interface Props {
  modelValue: boolean;
  navigationShortcuts: ShortcutGroup[];
  hasAnyShortcuts: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

// ============================
// DIALOG HANDLERS
// ============================

function closeDialog() {
  emit('update:modelValue', false);
}

/**
 * Handle model value updates from the dialog component
 */
function handleModelUpdate(isOpen: boolean) {
  emit('update:modelValue', isOpen);
}

// ============================
// DATA SOURCES
// ============================

/**
 * Domain navigation shortcuts from all sources
 * Filtered by CATEGORY_DOMAIN_NAVIGATION and excluding disabled shortcuts
 */
const domainNavigationShortcuts = computed(() => {
  const allShortcuts: ShortcutAction[] = [];

  // Collect domain navigation shortcuts from navigation shortcuts
  props.navigationShortcuts.forEach((nav) => {
    allShortcuts.push(...nav.shortcuts.filter((s) => s.category === CATEGORY_DOMAIN_NAVIGATION && !s.disabled));
  });

  return allShortcuts;
});

// ============================
// LAYOUT CALCULATIONS
// ============================

/**
 * Column width for the shortcuts section
 */
const columnWidth = 12; // Full width since we only have one section
</script>

<i18n src="~/locales/base/components/shortcuts-dialog.json"></i18n>

<style scoped>
/* Container with max height and scrolling */
.shortcut-dialog-container {
  max-height: 80vh;
  overflow-y: auto;
}

/* Remove default list padding */
.shortcut-list {
  padding: 0;
}
</style>

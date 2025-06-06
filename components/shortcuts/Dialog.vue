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
      :model-value="isDialogOpen"
      :title="t('title')"
      large
      fixed-footer
      @close="closeDialog"
      @update:model-value="handleModelUpdate"
    >
      <template #default>
        <v-container class="shortcut-dialog-container">
          <!-- SECTION: Dialog Header -->
          <v-row class="mb-2">
            <v-col cols="12">
              <div class="text-body-2 font-weight-bold">
                {{ t('openInstructions', { shortcut: '' }) }}
                <ShortcutsItem :shortcut="SHORTCUT_DIALOG_DISPLAY" show-tooltips compact-keys />
              </div>
            </v-col>
          </v-row>

          <!-- SECTION: Main Content -->
          <v-row>
            <!-- Domain Navigation Shortcuts -->
            <v-col v-if="domainNavigationShortcuts.length > 0" cols="12" :md="columnWidth">
              <v-card flat>
                <v-card-title class="text-subtitle-2 py-2">{{ t('domainNavigation') }}</v-card-title>
                <v-divider></v-divider>
                <v-list density="compact" class="shortcut-list">
                  <v-list-item
                    v-for="shortcut in domainNavigationShortcuts"
                    :key="shortcut.id"
                    class="text-body-2"
                    :class="{ 'shortcut-disabled': shortcut.disabled }"
                  >
                    <v-list-item-title class="text-body-2">
                      {{ shortcut.name }}
                      <v-chip v-if="shortcut.disabled" size="x-small" color="grey" class="ms-2">{{
                        t('disabled')
                      }}</v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle v-if="shortcut.description" class="text-caption">
                      {{ shortcut.description }}
                    </v-list-item-subtitle>
                    <template #append>
                      <ShortcutsItem
                        :shortcut="shortcut.shortcut"
                        :show-tooltips="true"
                        compact-keys
                        :disabled="shortcut.disabled"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>

            <!-- No shortcuts available message -->
            <v-col v-if="!hasAnyShortcuts" cols="12" class="text-center">
              <p class="text-body-2">{{ t('noShortcuts') }}</p>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import {
  CATEGORY_DOMAIN_NAVIGATION,
  SHORTCUT_DIALOG_DISPLAY,
  ShortcutAction,
  shortcutService
} from '~/composables/shortcuts/useShortcuts';

const { t } = useI18n();
// ============================
// DIALOG STATE
// ============================

const isDialogOpen = computed(() => shortcutService.getDialogState());

function closeDialog() {
  shortcutService.setDialogState(false);
}

/**
 * Handle model value updates from the dialog component
 */
function handleModelUpdate(isOpen: boolean) {
  shortcutService.setDialogState(isOpen);
}

// ============================
// DATA SOURCES
// ============================

/**
 * All navigation shortcuts from the shortcut service
 */
const navigationShortcutsArray = computed(() => shortcutService.getNavigationShortcuts());

/**
 * Domain navigation shortcuts from all sources
 * Filtered by CATEGORY_DOMAIN_NAVIGATION
 */
const domainNavigationShortcuts = computed(() => {
  const allShortcuts: ShortcutAction[] = [];

  // Collect domain navigation shortcuts from navigation shortcuts
  navigationShortcutsArray.value.forEach((nav) => {
    allShortcuts.push(...nav.shortcuts.filter((s) => s.category === CATEGORY_DOMAIN_NAVIGATION));
  });

  return allShortcuts;
});

// ============================
// PAGE-SPECIFIC SHORTCUTS
// ============================

/**
 * Whether any shortcuts are available to display
 * (either page-specific, domain navigation, or global navigation)
 */
const hasAnyShortcuts = computed(() => domainNavigationShortcuts.value.length > 0);

// ============================
// LAYOUT CALCULATIONS
// ============================

/**
 * Calculate column width based on number of visible sections
 * Divides the 12-column grid by the number of visible sections
 */
const columnWidth = computed(() => {
  let visibleColumns = 1; // Start with 1
  if (domainNavigationShortcuts.value.length > 0) visibleColumns++;
  return Math.floor(12 / visibleColumns);
});
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

/* Disabled shortcuts styling */
.shortcut-disabled {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
}
</style>

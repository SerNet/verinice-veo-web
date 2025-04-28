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
  <div class="keyboard-shortcut" :class="{ 'compact-keys': compactKeys, disabled: disabled }">
    <template v-for="(keyData, index) in keyDataArray" :key="index">
      <!-- Add '+' symbol between keys, but not before the first key -->
      <div v-if="index > 0" class="key-separator">
        <span class="separator-plus">+</span>
      </div>
      <v-chip
        v-tooltip="showTooltips && keyData.description ? keyData.description : undefined"
        size="x-small"
        variant="outlined"
        :color="getColorForKeyType(keyData.keyType, keyData.symbol)"
        class="key-chip"
        :class="[`key-width-${keyData.width || 'normal'}`]"
      >
        {{ keyData.symbol }}
      </v-chip>
    </template>
  </div>
</template>

<script setup lang="ts">
import { getShortcutKeyData } from '~/composables/shortcuts/KeyboardUtils';

const props = defineProps<{
  shortcut: string;
  showTooltips?: boolean;
  compactKeys?: boolean;
  disabled?: boolean;
}>();

// Extract key data from the shortcut
const keyDataArray = computed(() => {
  return getShortcutKeyData(props.shortcut);
});

// Function to determine the color based on key type
function getColorForKeyType(keyType: string, symbol?: string): string {
  // If shortcut is disabled, return grey regardless of key type
  if (props.disabled) {
    return 'grey';
  }

  // Special case for 'g' key - treat as navigation regardless of keyType
  if (symbol === 'g' || symbol === 'G') {
    return 'info'; // Navigation color
  }

  switch (keyType) {
    case 'modifier':
      return 'green';
    case 'action':
      return 'secondary';
    case 'special':
      return 'error';
    case 'navigation':
      return 'info';
    case 'function':
      return 'warning';
    default:
      return 'primary';
  }
}
</script>

<style scoped>
.keyboard-shortcut {
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 6px;
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  margin: 2px 0;
  position: relative;
}

.key-chip {
  font-family: var(--font-monospace, monospace);
  font-size: 11px;
  font-weight: 600;
  text-transform: none;
  height: 22px;
  min-width: 22px;
}

.key-width-wide {
  min-width: 38px;
}

.key-width-extra-wide {
  min-width: 52px;
}

.key-separator {
  display: flex;
  align-items: center;
  margin: 0 4px;
  height: 100%;
}

.separator-plus {
  font-weight: 600;
  color: rgba(var(--v-theme-primary), 0.7);
  font-size: 10px;
  margin: 0 1px;
}

.separator-dot {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-primary), 0.3);
}

.shortcut-alternative {
  margin-left: 6px;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.shortcut-alternative:hover {
  opacity: 1;
}

.alternative-btn {
  margin-left: 2px;
}

/* Compact styling overrides */
.compact-keys {
  padding: 1px 3px;
}

.compact-keys .key-separator {
  margin: 0 2px;
}

.compact-keys .separator-plus {
  font-size: 9px;
  margin: 0;
}

.compact-keys .separator-dot {
  width: 1px;
  height: 1px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: none;
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(var(--v-theme-primary), 0.2);
  }
  100% {
    transform: scale(1);
    box-shadow: none;
  }
}

/* Media query for smaller screens - reduce padding */
@media (max-width: 600px) {
  .keyboard-shortcut {
    padding: 1px 2px;
  }

  .key-separator {
    margin: 0 2px;
  }

  .separator-plus {
    font-size: 9px;
  }

  .key-chip {
    height: 20px;
    min-width: 20px;
    font-size: 10px;
  }
}

.disabled {
  opacity: 0.7;
  background-color: rgba(var(--v-theme-surface-variant), 0.02);
  border-color: rgba(var(--v-theme-outline), 0.05);
}

.shortcut-disabled {
  opacity: 0.8;
}
</style>

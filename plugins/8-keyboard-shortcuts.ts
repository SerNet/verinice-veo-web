/*
 * verinice.veo web
 * Copyright (C) 2025 Aziz Khalledi
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */

import { useActiveElement, useEventListener } from '@vueuse/core';
import { isInputElement } from '~/composables/shortcuts/KeyboardUtils';
import { shortcutService } from '~/composables/shortcuts/useShortcuts';

// Set up a global shortcut listener for the dialog shortcut
function setupKeyboardListener() {
  // Add a global document event listener as a fallback
  const handleKeyDown = (event: KeyboardEvent) => {
    // Check for Shift+? combo
    if (event.key === '?' && event.shiftKey) {
      shortcutService.toggleShortcutDialog();
    }
  };

  // Add the listener
  document.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

export default defineNuxtPlugin(() => {
  // Create a global ref for tracking dialog visibility
  const isDialogVisible = ref(false);

  // Sync with the actual dialog state
  watch(isDialogVisible, (visible) => {
    shortcutService.setDialogState(visible);
  });

  // Set up the dialog shortcut handler
  const cleanupKeyboardListener = setupKeyboardListener();
  // Get the currently active/focused element
  const activeElement = useActiveElement();

  // Watch for changes to the active element to detect when user is typing
  watch(
    activeElement,
    (el) => {
      shortcutService.setShortcutsEnabled(!isInputElement(el));
    },
    { immediate: true }
  );

  // Additional event listener to catch specific cases that might be missed
  const stopInputListener = useEventListener(document, 'input', () => {
    shortcutService.setShortcutsEnabled(!isInputElement(document.activeElement));
  });

  onBeforeUnmount(() => {
    cleanupKeyboardListener();
    stopInputListener();
  });
});

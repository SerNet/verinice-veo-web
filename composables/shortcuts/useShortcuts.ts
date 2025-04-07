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
import { useMagicKeys } from '@vueuse/core';
// ===== Constants =====
// Global shortcut that opens the shortcuts dialog
export const SHORTCUT_DIALOG_DISPLAY = 'Shift + ?';

// Shortcut categories for categorizing shortcuts in the dialog
export const CATEGORY_DOMAIN_NAVIGATION = 'Domain Navigation';

// ===== Types =====
export interface ShortcutAction {
  id: string;
  name: string;
  shortcut: string;
  description: string;
  action: () => void;
  category?: string;
  disabled?: boolean;
}

export interface PageSpecificShortcuts {
  pageId: string;
  pageName: string;
  shortcuts: ShortcutAction[];
}

export interface NavigationShortcuts {
  navigationName: string;
  shortcuts: ShortcutAction[];
}

// ===== State =====
// Create a reactive state that can be shared
const shortcutState = reactive({
  shortcuts: [] as (NavigationShortcuts | PageSpecificShortcuts)[],
  isShortcutDialogOpen: false,
  useShortcuts: true
});

// ===== Service =====
// Centralized service for shortcut management
export const shortcutService = {
  registerShortcuts(shortcutsObj: NavigationShortcuts | PageSpecificShortcuts): void {
    const id = 'pageId' in shortcutsObj ? shortcutsObj.pageId : shortcutsObj.navigationName;
    const type = 'pageId' in shortcutsObj ? 'page' : 'navigation';

    // Remove any existing shortcuts for this id
    this.unregisterShortcuts(id, type);

    // Add the new shortcuts
    shortcutState.shortcuts.push(shortcutsObj);
  },

  unregisterShortcuts(id: string, type: 'page' | 'navigation'): void {
    shortcutState.shortcuts = shortcutState.shortcuts.filter((item) => {
      if (type === 'page' && 'pageId' in item) {
        return item.pageId !== id;
      } else if (type === 'navigation' && 'navigationName' in item) {
        return item.navigationName !== id;
      }
      return true;
    });

    // Clean up any active watchers
    if (keyUnwatchers[id]) {
      keyUnwatchers[id].forEach((unwatch) => unwatch());
      delete keyUnwatchers[id];
    }
  },

  getPageShortcuts(pageId: string): PageSpecificShortcuts | undefined {
    return shortcutState.shortcuts.find(
      (item): item is PageSpecificShortcuts => 'pageId' in item && item.pageId === pageId
    );
  },

  getNavigationShortcuts(): NavigationShortcuts[] {
    return shortcutState.shortcuts.filter((item): item is NavigationShortcuts => 'navigationName' in item);
  },

  getAllPageShortcuts(): PageSpecificShortcuts[] {
    return shortcutState.shortcuts.filter((item): item is PageSpecificShortcuts => 'pageId' in item);
  },

  shouldHandleShortcuts(callback?: () => void): boolean {
    if (shortcutState.useShortcuts) {
      if (callback) callback();
      return true;
    }
    return false;
  },

  toggleShortcutDialog(): void {
    shortcutState.isShortcutDialogOpen = !shortcutState.isShortcutDialogOpen;
  },

  getDialogState(): boolean {
    return shortcutState.isShortcutDialogOpen;
  },

  setDialogState(isOpen: boolean): void {
    shortcutState.isShortcutDialogOpen = isOpen;
  },

  setShortcutsEnabled(enabled: boolean): void {
    shortcutState.useShortcuts = enabled;
  }
};

// ===== Core binding function =====
const keyUnwatchers: Record<string, (() => void)[]> = {};

function bindShortcuts(shortcuts: ShortcutAction[], id: string) {
  const isTyping = ref(false);
  const keys = useMagicKeys();

  if (keyUnwatchers[id]) {
    keyUnwatchers[id].forEach((unwatch) => unwatch());
    delete keyUnwatchers[id];
  }

  keyUnwatchers[id] = [];

  // Set up keyboard bindings for each shortcut
  shortcuts.forEach((shortcut) => {
    const keyName = shortcut.shortcut.replace(/\+/g, '_');

    const unwatch = watchEffect(() => {
      if (keys[keyName].value && !isTyping.value) {
        shortcutService.shouldHandleShortcuts(() => {
          if (shortcut.disabled) return;
          shortcut.action();
        });
      }
    });

    keyUnwatchers[id].push(unwatch);
  });

  // Helper functions to enable/disable shortcuts when typing
  const disableShortcuts = () => {
    isTyping.value = true;
    shortcutService.setShortcutsEnabled(false);
  };

  const enableShortcuts = () => {
    isTyping.value = false;
    shortcutService.setShortcutsEnabled(true);
  };

  return {
    disableShortcuts,
    enableShortcuts
  };
}

/**
 * Main composable for registering and using shortcuts
 */
export function useShortcuts(
  id: string,
  name: string,
  shortcuts: ShortcutAction[],
  type: 'page' | 'navigation' = 'page'
) {
  // Register shortcuts with the service
  const shortcutsObj =
    type === 'page' ?
      ({ pageId: id, pageName: name, shortcuts } as PageSpecificShortcuts)
    : ({ navigationName: id, shortcuts } as NavigationShortcuts);

  shortcutService.registerShortcuts(shortcutsObj);

  // Bind keyboard shortcuts
  const { disableShortcuts, enableShortcuts } = bindShortcuts(shortcuts, id);

  // Clean up on unmount
  onUnmounted(() => {
    shortcutService.unregisterShortcuts(id, type);
  });

  // Return convenient methods
  return {
    disableShortcuts,
    enableShortcuts,
    isDialogOpen: computed(() => shortcutService.getDialogState())
  };
}

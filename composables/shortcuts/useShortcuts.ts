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
import { ShortcutTrie } from './ShortcutTrie';
import { useDomainShortcuts } from './domainShortcuts';
import { KeyboardHandler } from './keyboardHandler';
import { ShortcutRegistryService } from './shortcutRegistry';
import { CATEGORY_DOMAIN_NAVIGATION } from './types';

let isInitialized = false;
let cleanupFns: (() => void)[] = [];

let shortcutTrie: ShortcutTrie;
let keyboardHandler: KeyboardHandler;
let registry: ShortcutRegistryService;

function setupDialogShortcut(): () => void {
  const handler = (event: KeyboardEvent) => {
    if (event.key === '?' && event.shiftKey) {
      registry.toggleDialog();
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}

function initializeGlobalShortcuts(): void {
  if (isInitialized) return;

  shortcutTrie = new ShortcutTrie();
  registry = new ShortcutRegistryService(shortcutTrie);
  keyboardHandler = new KeyboardHandler(shortcutTrie, {
    onExactMatch: (shortcut) => shortcut.action(),
    onSequenceReset: () => {},
    isEnabled: () => true
  });

  const keyboardCleanup = keyboardHandler.initialize();
  const dialogCleanup = setupDialogShortcut();
  const domainCleanup = useDomainShortcuts(registry).initialize();

  cleanupFns = [keyboardCleanup, dialogCleanup, domainCleanup];
  isInitialized = true;

  onScopeDispose(() => {
    cleanupFns.forEach((fn) => fn());
    cleanupFns = [];
    registry.clear();
    isInitialized = false;
  });
}

export function useShortcuts() {
  initializeGlobalShortcuts();

  const { shortcutGroups, isDialogOpen } = registry.getReactive();

  const navigationShortcuts = computed(() =>
    shortcutGroups.value.map((group) => ({
      ...group,
      shortcuts: group.shortcuts.filter((s) => s.category === CATEGORY_DOMAIN_NAVIGATION && !s.disabled)
    }))
  );

  return {
    isDialogOpen,
    toggleDialog: () => registry.toggleDialog(),
    navigationShortcuts,
    hasAnyShortcuts: computed(() => navigationShortcuts.value?.some((group) => group.shortcuts.length > 0))
  };
}

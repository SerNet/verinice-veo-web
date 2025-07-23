/*
 * verinice.veo web
 * Copyright (C) 2025 jae
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
import { useActiveElement } from '@vueuse/core';
import { DOMAIN_SHORTCUTS_CONFIG, STATIC_SHORTCUTS_CONFIG } from './shortcutConfig';

export function useShortcuts() {
  const isDialogOpen = ref(false);

  const modifiers = Object.values({
    ...DOMAIN_SHORTCUTS_CONFIG.navigation,
    ...DOMAIN_SHORTCUTS_CONFIG.elementTypes,
    ...STATIC_SHORTCUTS_CONFIG.navigation
  }).map(([modifier]) => modifier);
  const relevantKeys = Object.values({
    ...DOMAIN_SHORTCUTS_CONFIG.navigation,
    ...DOMAIN_SHORTCUTS_CONFIG.elementTypes,
    ...STATIC_SHORTCUTS_CONFIG.navigation
  }).map(([, relevantKey]) => relevantKey);

  const SEQUENCE_TIMEOUT_MS = 1000;
  const keySequence = ref([]);

  const { isInputElement } = useInputElementDetection();
  const { data: domainShortcuts } = useDomainShortcuts();
  const { data: staticShortcuts } = useStaticShortcuts();
  const shortcuts = computed(() => [...domainShortcuts.value, ...staticShortcuts.value].filter((s) => !s.disabled));

  const keys = useMagicKeys();
  const current = keys.current;

  const isDialogTrigger = keys['Shift+?'];

  function getKeys(keySet: Set<string>, acceptedKeys: string[]) {
    return acceptedKeys.find((key) => keySet.has(key)) ?? [];
  }

  function clearShortcutSequence() {
    keySequence.value = [];
  }

  function runShortcut(keySequence: string[], shortcuts) {
    const shortcut = shortcuts.find((s) => s.keys.join() === keySequence.join());
    shortcut?.action?.();
  }

  const unwatchKeys = watch(current, (keys) => {
    if (!current.size || isInputElement.value) return;

    // Open dialog
    if (isDialogTrigger.value) {
      isDialogOpen.value = true;
      return;
    }

    // Check for modifiers
    if (!keySequence.value.length) {
      keySequence.value = [...getKeys(keys, modifiers)];
      setTimeout(clearShortcutSequence, SEQUENCE_TIMEOUT_MS);
      return;
    }

    // Add key to key sequence
    keySequence.value = [...keySequence.value, ...getKeys(keys, relevantKeys)];

    if (keySequence.value.length == 2) {
      runShortcut(keySequence.value, shortcuts.value);
      return;
    }
  });

  onScopeDispose(() => {
    unwatchKeys();
  });

  return {
    shortcuts,
    isDialogOpen
  };
}

function useInputElementDetection() {
  const activeElement = useActiveElement();

  function isInputElement(el: Element | null): boolean {
    if (!el) return false;

    const tagName = el.tagName.toLowerCase();
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      el.hasAttribute('contenteditable') ||
      el.getAttribute('role') === 'textbox' ||
      el.getAttribute('role') === 'combobox'
    );
  }

  return {
    isInputElement: computed(() => isInputElement(activeElement.value))
  };
}

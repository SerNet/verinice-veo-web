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

import { last } from 'lodash';
import {
  CATEGORY_DOMAIN_NAVIGATION,
  shortcutService,
  useShortcuts,
  type ShortcutAction
} from '~/composables/shortcuts/useShortcuts';
import { ROUTE_NAME as OBJECT_OVERVIEW_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/[objectType]/[subType]/index.vue';
import { ROUTE_NAME as EDITOR_ROUTE_NAME } from '~/pages/[unit]/domains/[domain]/editor/index.vue';
import { VeoElementTypePlurals } from '~/types/VeoTypes';

/**
 * Composable for domain page shortcuts
 * @param currentDomain The domain data object that contains elementTypeDefinitions
 * @param handlers Optional handlers for actions
 */
export function useGlobalDomainShortcuts() {
  // Get router and route inside the setup function
  const router = useRouter();
  const route = useRoute();
  const { data: currentDomain } = useCurrentDomain();

  // Current domain ID from route params
  const domainId = computed(() => route?.params?.domain as string);
  const unitId = computed(() => route?.params?.unit as string);

  // Create page identifier for the shortcuts
  const pageId = computed(() => `domain-${domainId.value}`);

  // Base shortcuts that are always available
  const baseShortcuts = computed<ShortcutAction[]>(() => [
    // Domain action shortcuts
    {
      id: 'nav-home',
      name: 'Dashboard/Home',
      description: 'Navigate to the dashboard page',
      shortcut: 'g+d',
      category: CATEGORY_DOMAIN_NAVIGATION,
      action: () => router.push('/')
    },
    {
      id: 'dom-to_editor',
      name: 'Open Editor',
      description: 'Navigate to the editor page',
      shortcut: 'g+e',
      category: CATEGORY_DOMAIN_NAVIGATION,
      action: () =>
        router.push({
          name: EDITOR_ROUTE_NAME,
          params: { unit: unitId.value, domain: domainId.value }
        })
    }
  ]);

  // Element type shortcuts based on domain data
  const elementTypeShortcuts = computed(() => {
    const elementTypes = Object.keys(VeoElementTypePlurals) as Array<keyof typeof VeoElementTypePlurals>;

    // Count first letters to detect duplicates
    const firstLetterCount: Record<string, number> = {};
    elementTypes.forEach((type) => {
      const firstLetter = type[0].toLowerCase();
      firstLetterCount[firstLetter] = (firstLetterCount[firstLetter] || 0) + 1;
    });

    const letterIndices: Record<string, number> = {};
    return elementTypes.map((elementType) => {
      const firstLetter = elementType[0].toLowerCase();

      if (letterIndices[firstLetter] === undefined) {
        letterIndices[firstLetter] = 1;
      } else {
        letterIndices[firstLetter]++;
      }

      // Create shortcut key - add index if this letter appears multiple times
      let shortcutKey = `g+${firstLetter}`;
      if (firstLetterCount[firstLetter] > 1) {
        shortcutKey += `+${letterIndices[firstLetter]}`;
      }

      // Check if the shortcut should be disabled
      const subTypes = currentDomain.value?.raw?.elementTypeDefinitions?.[elementType]?.subTypes;
      const isDisabled = !subTypes || Object.keys(subTypes).length === 0;

      return {
        id: `nav-${elementType}`,
        name: `Open ${elementType}`,
        description: `Navigate to ${elementType} page`,
        shortcut: shortcutKey,
        category: CATEGORY_DOMAIN_NAVIGATION,
        disabled: isDisabled,
        action: () =>
          router.push({
            name: OBJECT_OVERVIEW_ROUTE_NAME,
            params: {
              unit: route?.params?.unit,
              domain: route?.params?.domain,
              objectType: VeoElementTypePlurals[elementType as keyof typeof VeoElementTypePlurals],
              subType: '-'
            }
          })
      };
    });
  });

  // Combine base shortcuts with dynamic element type shortcuts
  const allShortcuts = computed<ShortcutAction[]>(() => {
    return [...baseShortcuts.value, ...elementTypeShortcuts.value];
  });

  // Watch for route changes to register/unregister shortcuts
  watch(
    [route, allShortcuts],
    () => {
      const routeToMatch = last(route?.matched)?.path || '';

      if (routeToMatch.startsWith('/:unit()/domains/:domain()')) {
        useShortcuts(pageId.value, 'Domain Navigation', allShortcuts.value, 'navigation');
      } else {
        shortcutService.unregisterShortcuts(pageId.value, 'navigation');
      }
    },
    { deep: true, immediate: true }
  );
}

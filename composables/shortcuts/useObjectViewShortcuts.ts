/*
 * verinice.veo web
 * Copyright (C) 2025 Haneen Husin
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
import { getObjectActionKeys } from './shortcutConfig';
import { OBJECT_OVERVIEW_SHORTCUT, type Shortcut } from './types';
import { sortUnits } from '~/composables/units/useUnits';

export function useObjectViewShortcuts() {
  const route = useRoute();
  const { t } = useI18n();

  const { data: units } = useUnits();
  const firstUnit = computed(() => units.value.sort(sortUnits)?.[0]);
  const domainId = computed(() => route?.params?.domain);
  const unitId = computed(() => route?.params?.unit ?? (firstUnit.value?.id as string));
  const objectId = computed(() => route?.params?.object);
  const objectType = computed(() => route?.params?.objectType);

  const objectShortcuts = computed<Shortcut[]>(() => {
    return Object.keys(OBJECT_OVERVIEW_SHORTCUTS_CONFIG.objectAction).map((action) => {
      const isDisabled = !objectType.value || !objectId.value;
      return {
        id: `nav-${action}`,
        name: t(`shortcuts.objectAction.${action}.name`),
        description: t(`shortcuts.objectAction.${action}.description`),
        keys: getObjectActionKeys(action),
        disabled: isDisabled,
        category: OBJECT_OVERVIEW_SHORTCUT,
        action: () => {}
      };
    });
  });

  const actionObjectShortcuts = computed<Shortcut[]>(() => {
    if (!unitId.value || !domainId.value || !objectId.value) return [];
    return objectShortcuts.value;
  });

  return {
    data: actionObjectShortcuts
  };
}

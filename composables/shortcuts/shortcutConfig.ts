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

import { VeoElementTypePlurals } from '~/types/VeoTypes';

export const DOMAIN_SHORTCUTS_CONFIG = {
  // Base navigation shortcuts
  navigation: {
    home: 'g+b',
    editor: 'g+d',
    catalogs: 'g+t',
    reports: 'g+r',
    riskDefinitions: 'g+f',
    menu: 'g+m'
  },

  // Element type shortcuts
  elementTypes: {
    scope: 'g+s',
    process: 'g+p',
    asset: 'g+a',
    person: 'g+n',
    incident: 'g+i',
    document: 'g+o',
    control: 'g+c',
    scenario: 'g+e'
  } as Record<keyof typeof VeoElementTypePlurals, string>
} as const;

export function getElementTypeKeys(elementType: keyof typeof VeoElementTypePlurals): string {
  return DOMAIN_SHORTCUTS_CONFIG.elementTypes[elementType];
}

export function getNavigationKeys(action: keyof typeof DOMAIN_SHORTCUTS_CONFIG.navigation): string {
  return DOMAIN_SHORTCUTS_CONFIG.navigation[action];
}

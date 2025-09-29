/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { AbilityBuilder, createMongoAbility } from '@casl/ability';

const ability = ref(createMongoAbility());

// Base permissions that gets overwritten IF the user is authenticated & entering a protected route
const { can, rules } = new AbilityBuilder(createMongoAbility);
can('view', 'documentation');
// @ts-ignore Some casl typing error, however the docs show this is the right way and it works
ability.value.update(rules);

export const useVeoPermissions = () => {
  const updatePermissions = (permissions: string[]) => {
    const { can, cannot, rules } = new AbilityBuilder(createMongoAbility);

    can('view', 'all');

    if (permissions.includes('veo-write')) {
      can('manage', 'all');
    } else {
      cannot('manage', 'all');
    }
    if (permissions.includes('veo-content-creator')) {
      can('view', 'editors');
      can('manage', 'editors');
    } else {
      cannot('view', 'editors');
      cannot('manage', 'editors');
    }

    if (permissions.includes('account:read')) {
      can('view', 'accounts');
    } else {
      cannot('view', 'accounts');
    }
    if (permissions.includes('account:manage')) {
      can('manage', 'accounts');
    } else {
      cannot('manage', 'accounts');
    }

    // --- Unit permissions ---
    const hasAccessRestrictions = permissions.includes('unit_access_restriction');
    const hasReadWriteAllUnits = permissions?.includes('read_write_all_units');
    // If 'unit_access_restrictions' is NOT present, all users can manage units.
    if (!hasAccessRestrictions || hasReadWriteAllUnits) {
      can('manage', 'units');
    } else {
      if (permissions.includes('unit:create')) {
        can('create', 'units');
      }
      if (permissions.includes('unit:update')) {
        can('update', 'units');
      }
      if (permissions.includes('unit:delete')) {
        can('delete', 'units');
      }
    }
    // @ts-ignore For some reason the rules and update types are incompatible, they work however
    ability.value.update(rules);
  };

  return { ability, updatePermissions };
};

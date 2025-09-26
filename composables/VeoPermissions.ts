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

let isWatcherInitialized = false;

export const useVeoPermissions = () => {
  const route = useRoute();
  const unitId = computed(() => route?.params?.unit);
  const { keycloak, roles } = useVeoUser();

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
    const unitWriteAccess = keycloak.value?.tokenParsed?.unit_write_access ?? [];
    // If 'unit_access_restrictions' is NOT present, all users can manage units.
    if (!hasAccessRestrictions || hasReadWriteAllUnits) {
      can('manage', 'units');
    } else {
      // Check if user has write access to the current unit
      if (unitId && unitWriteAccess.includes(unitId.value)) {
        can('manage', 'units');
      } else {
        cannot('manage', 'units');
      }

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

  // This ensures permissions are refreshed when the selected unit changes or Roles
  if (!isWatcherInitialized) {
    isWatcherInitialized = true;

    watch(
      [() => unitId.value, () => roles.value],
      () => {
        updatePermissions([
          ...(keycloak.value?.tokenParsed?.realm_access?.roles || []),
          ...(keycloak.value?.tokenParsed?.resource_access?.['veo-accounts']?.roles || [])
        ]);
      },
      { immediate: true }
    );
  }
  return { ability, updatePermissions };
};

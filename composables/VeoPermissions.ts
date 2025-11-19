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

import { AbilityBuilder, createMongoAbility, subject } from '@casl/ability';

const ability = ref(createMongoAbility());

/**
 * @description Permissions for global unit actions, e.g. create, update, delete a whole unit,
 * `update` in this sense means updating a unit's' metadata like name, description as well as domains etc.
 */
function buildGlobalUnitPermissions(permissions: string[]) {
  const { can, rules } = new AbilityBuilder(createMongoAbility);
  const hasAccessRestriction = permissions?.includes('unit_access_restriction');

  if (hasAccessRestriction) {
    if (permissions.includes('unit:create')) {
      can('create', 'unit');
    }
    if (permissions.includes('unit:update')) {
      can('update', 'unit');
    }
    if (permissions.includes('unit:delete')) {
      can('delete', 'unit');
    }
    return rules;
  }

  // The key `unit_access_restriction` is not present -> full access for everyone!
  can('create', 'unit');
  can('update', 'unit');
  can('delete', 'unit');
  return rules;
}

/** @description Permissions for unit-specific actions, e.g. create, update, delete objects, currently you may either do everything or nothing. That's why we use `manage` */
function buildLocalUnitPermissions(permissions: string[], unitWriteAccess: string[], unitIds: string[]) {
  const { can, rules } = new AbilityBuilder(createMongoAbility);

  const hasAccessRestriction = permissions?.includes('unit_access_restriction');
  const hasReadWriteAllUnits = permissions?.includes('read_write_all_units');
  const hasVeoWriteRole = permissions.includes('veo-write');

  if (hasVeoWriteRole) {
    if (hasAccessRestriction) {
      if (hasReadWriteAllUnits) {
        unitIds.forEach((id) => can('manage', 'units', { id }));
      } else {
        // prettier-ignore
        unitIds.forEach((id) => (
        (unitWriteAccess.includes(id)) ?
          can('manage', 'units', { id }) :
          null
      ));
      }
      return rules;
    }
    // The key `unit_access_restriction` is not present -> full access for all people with `veo-write` role!
    unitIds.forEach((id) => can('manage', 'units', { id }));
  }
  return rules;
}

function updateUnitPermissions(permissions: string[], unitWriteAccess: string[], unitIds: string[]) {
  return [
    ...buildGlobalUnitPermissions(permissions),
    ...buildLocalUnitPermissions(permissions, unitWriteAccess, unitIds)
  ];
}

function updatePermissions(permissions: string[], unitWriteAccess: string[], unitIds: string[]) {
  const { can, cannot, rules } = new AbilityBuilder(createMongoAbility);
  const hasAccessRestrictions = permissions?.includes('unit_access_restriction');

  can('view', 'all');

  if (permissions.includes('veo-write') && !hasAccessRestrictions) {
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

  const unitPermissionRules = updateUnitPermissions(permissions, unitWriteAccess, unitIds);

  ability.value.update([...rules, ...unitPermissionRules]);
}

export const createVeoPermissions = () => {
  const { data: units } = useUnits();
  const unitIds = computed(() => units.value?.map((unit) => unit.id) || []);

  const { keycloak, initialize: isKeycloakInitilized } = useVeoUser();
  const unitWriteAccess = computed(() => keycloak.value?.tokenParsed?.unit_write_access ?? []);

  const unwatch = watch(
    [unitWriteAccess, unitIds],
    async () => {
      if (!isKeycloakInitilized) return;
      updatePermissions(
        [
          ...(keycloak.value?.tokenParsed?.realm_access?.roles || []),
          ...(keycloak.value?.tokenParsed?.resource_access?.['veo-accounts']?.roles || [])
        ],
        unitWriteAccess.value,
        unitIds.value
      );
    },
    { immediate: true }
  );

  onScopeDispose(() => {
    unwatch();
  });

  return { ability, subject };
};

let veoPermissionsInstance: ReturnType<typeof createVeoPermissions> | null = null;

export function useVeoPermissions() {
  if (!veoPermissionsInstance) {
    veoPermissionsInstance = createVeoPermissions();
  }
  return veoPermissionsInstance;
}

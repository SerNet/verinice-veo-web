/*
 * verinice.veo web
 * Copyright (C) 2026 jae
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

import { describe, it, expect } from 'vitest';
import { createMongoAbility, subject } from '@casl/ability';
import { isEmpty, isArray } from 'lodash';
import { buildGlobalUnitPermissions, buildLocalUnitPermissions } from '~/composables/VeoPermissions';

describe('buildGlobalUnitPermissions', () => {
  it('should return empty rules when permissions is not an array', () => {
    const result = buildGlobalUnitPermissions(null as any);
    expect(isEmpty(result)).toBe(true);
  });

  it('should return empty rules when permissions is undefined', () => {
    const result = buildGlobalUnitPermissions(undefined as any);
    expect(isEmpty(result)).toBe(true);
  });

  it('should return empty rules when veo-write permission is not present', () => {
    const permissions = ['some-other-permission', 'another-permission'];
    const result = buildGlobalUnitPermissions(permissions);
    expect(isEmpty(result)).toBe(true);
  });

  it('should grant all unit permissions when user has veo-write but no unit_access_restriction', () => {
    const permissions = ['veo-write'];
    const result = buildGlobalUnitPermissions(permissions);

    // Check that all unit actions are allowed
    const ability = createMongoAbility(result);
    expect(ability.can('create', 'unit')).toBe(true);
    expect(ability.can('update', 'unit')).toBe(true);
    expect(ability.can('delete', 'unit')).toBe(true);
  });

  describe('with unit_access_restriction role', () => {
    it('should grant only create permission when user has unit:create', () => {
      const permissions = ['veo-write', 'unit_access_restriction', 'unit:create'];
      const result = buildGlobalUnitPermissions(permissions);

      const ability = createMongoAbility(result);
      expect(ability.can('create', 'unit')).toBe(true);
      expect(ability.can('update', 'unit')).toBe(false);
      expect(ability.can('delete', 'unit')).toBe(false);
    });

    it('should grant only update permission when user has unit:update', () => {
      const permissions = ['veo-write', 'unit_access_restriction', 'unit:update'];
      const result = buildGlobalUnitPermissions(permissions);

      const ability = createMongoAbility(result);
      expect(ability.can('create', 'unit')).toBe(false);
      expect(ability.can('update', 'unit')).toBe(true);
      expect(ability.can('delete', 'unit')).toBe(false);
    });

    it('should grant only delete permission when user has unit:delete', () => {
      const permissions = ['veo-write', 'unit_access_restriction', 'unit:delete'];
      const result = buildGlobalUnitPermissions(permissions);

      const ability = createMongoAbility(result);
      expect(ability.can('create', 'unit')).toBe(false);
      expect(ability.can('update', 'unit')).toBe(false);
      expect(ability.can('delete', 'unit')).toBe(true);
    });

    it('should grant multiple permissions when user has multiple unit permissions', () => {
      const permissions = ['veo-write', 'unit_access_restriction', 'unit:create', 'unit:update'];
      const result = buildGlobalUnitPermissions(permissions);

      const ability = createMongoAbility(result);
      expect(ability.can('create', 'unit')).toBe(true);
      expect(ability.can('update', 'unit')).toBe(true);
      expect(ability.can('delete', 'unit')).toBe(false);
    });

    it('should grant all unit permissions when user has all specific permissions', () => {
      const permissions = ['veo-write', 'unit_access_restriction', 'unit:create', 'unit:update', 'unit:delete'];
      const result = buildGlobalUnitPermissions(permissions);

      const ability = createMongoAbility(result);
      expect(ability.can('create', 'unit')).toBe(true);
      expect(ability.can('update', 'unit')).toBe(true);
      expect(ability.can('delete', 'unit')).toBe(true);
    });

    it('should return empty rules when user has unit_access_restriction but no specific unit permissions', () => {
      const permissions = ['veo-write', 'unit_access_restriction'];
      const result = buildGlobalUnitPermissions(permissions);

      const ability = createMongoAbility(result);
      expect(ability.can('create', 'unit')).toBe(false);
      expect(ability.can('update', 'unit')).toBe(false);
      expect(ability.can('delete', 'unit')).toBe(false);
    });

    it('should ignore unit permissions when veo-write is not present', () => {
      const permissions = ['unit_access_restriction', 'unit:create', 'unit:update', 'unit:delete'];
      const result = buildGlobalUnitPermissions(permissions);

      expect(isEmpty(result)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty permissions array', () => {
      const permissions: string[] = [];
      const result = buildGlobalUnitPermissions(permissions);
      expect(isEmpty(result)).toBe(true);
    });
  });
});

describe('buildLocalUnitPermissions', () => {
  const sampleUnitIds = ['unit-1', 'unit-2', 'unit-3'];
  const sampleUnitWriteAccess = ['unit-1', 'unit-3'];

  it('should return empty rules when permissions is not an array', () => {
    const result = buildLocalUnitPermissions(null as any, sampleUnitWriteAccess, sampleUnitIds);
    expect(isArray(result)).toBe(true);
    expect(isEmpty(result)).toBe(true);
  });

  it('should return empty rules when permissions is undefined', () => {
    const result = buildLocalUnitPermissions(undefined as any, sampleUnitWriteAccess, sampleUnitIds);
    expect(isArray(result)).toBe(true);
    expect(isEmpty(result)).toBe(true);
  });

  it('should return empty rules when veo-write permission is not present', () => {
    const permissions = ['some-other-permission', 'another-permission'];
    const result = buildLocalUnitPermissions(permissions, sampleUnitWriteAccess, sampleUnitIds);
    expect(isArray(result)).toBe(true);
    expect(isEmpty(result)).toBe(true);
  });

  it('should grant manage permissions for all units when user has veo-write but no unit_access_restriction', () => {
    const permissions = ['veo-write'];
    const result = buildLocalUnitPermissions(permissions, sampleUnitWriteAccess, sampleUnitIds);

    const ability = createMongoAbility(result);
    sampleUnitIds.forEach((unitId) => {
      expect(ability.can('manage', subject('units', { id: unitId }))).toBe(true);
    });
  });

  describe('with unit_access_restriction role', () => {
    it('should grant manage permissions for all units when user has read_write_all_units', () => {
      const permissions = ['veo-write', 'unit_access_restriction', 'read_write_all_units'];
      const result = buildLocalUnitPermissions(permissions, sampleUnitWriteAccess, sampleUnitIds);

      const ability = createMongoAbility(result);
      sampleUnitIds.forEach((unitId) => {
        expect(ability.can('manage', subject('units', { id: unitId }))).toBe(true);
      });
    });

    it('should grant manage permissions only for units in unitWriteAccess when no read_write_all_units', () => {
      const permissions = ['veo-write', 'unit_access_restriction'];
      const result = buildLocalUnitPermissions(permissions, sampleUnitWriteAccess, sampleUnitIds);

      const ability = createMongoAbility(result);

      // Should have access to units in unitWriteAccess
      expect(ability.can('manage', subject('units', { id: 'unit-1' }))).toBe(true);
      expect(ability.can('manage', subject('units', { id: 'unit-3' }))).toBe(true);

      // Should NOT have access to units not in unitWriteAccess
      expect(ability.can('manage', subject('units', { id: 'unit-2' }))).toBe(false);
    });

    it('should handle empty unitWriteAccess array', () => {
      const permissions = ['veo-write', 'unit_access_restriction'];
      const emptyUnitWriteAccess: string[] = [];
      const result = buildLocalUnitPermissions(permissions, emptyUnitWriteAccess, sampleUnitIds);

      const ability = createMongoAbility(result);
      sampleUnitIds.forEach((unitId) => {
        expect(ability.can('manage', subject('units', { id: unitId }))).toBe(false);
      });
    });

    it('should handle unitWriteAccess with units not in unitIds', () => {
      const permissions = ['veo-write', 'unit_access_restriction'];
      const extendedUnitWriteAccess = ['unit-1', 'unit-3', 'unit-999'];
      const result = buildLocalUnitPermissions(permissions, extendedUnitWriteAccess, sampleUnitIds);

      const ability = createMongoAbility(result);

      // Should have access to valid units in both arrays
      expect(ability.can('manage', subject('units', { id: 'unit-1' }))).toBe(true);
      expect(ability.can('manage', subject('units', { id: 'unit-3' }))).toBe(true);

      // Should not have access to unit not in unitIds
      expect(ability.can('manage', subject('units', { id: 'unit-2' }))).toBe(false);
    });

    it('should handle read_write_all_units with empty unitIds', () => {
      const permissions = ['veo-write', 'unit_access_restriction', 'read_write_all_units'];
      const emptyUnitIds: string[] = [];
      const result = buildLocalUnitPermissions(permissions, sampleUnitWriteAccess, emptyUnitIds);

      expect(isArray(result)).toBe(true);
      expect(isEmpty(result)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty permissions array', () => {
      const permissions: string[] = [];
      const result = buildLocalUnitPermissions(permissions, sampleUnitWriteAccess, sampleUnitIds);
      expect(isArray(result)).toBe(true);
      expect(isEmpty(result)).toBe(true);
    });

    it('should handle empty unitIds array', () => {
      const permissions = ['veo-write'];
      const emptyUnitIds: string[] = [];
      const result = buildLocalUnitPermissions(permissions, sampleUnitWriteAccess, emptyUnitIds);

      expect(isArray(result)).toBe(true);
      expect(isEmpty(result)).toBe(true);
    });

    it('should handle null unitWriteAccess array', () => {
      const permissions = ['veo-write', 'unit_access_restriction'];
      const result = buildLocalUnitPermissions(permissions, null as any, sampleUnitIds);

      const ability = createMongoAbility(result);
      sampleUnitIds.forEach((unitId) => {
        expect(ability.can('manage', subject('units', { id: unitId }))).toBe(false);
      });
    });
  });
});

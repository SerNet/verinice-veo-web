/*
 * verinice.veo web
 * Copyright (C) 2024
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
import { createMongoAbility } from '@casl/ability';
import { isEmpty } from 'lodash';
import { buildGlobalUnitPermissions } from '../VeoPermissions';

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

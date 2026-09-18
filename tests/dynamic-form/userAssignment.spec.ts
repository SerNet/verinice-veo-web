/*
 * verinice.veo web
 * Copyright (C) 2026 Aziz Khalledi
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
import { describe, expect, it } from 'vitest';

import {
  hasUserAssignment,
  injectUserAssignmentGroup,
  USER_ASSIGNMENT_GROUP_CLASS,
  USERNAME_SCOPE
} from '~/components/dynamic-form/userAssignment';
import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';

const labels = { group: 'Benutzerzuordnung', control: 'Verknüpfter Account' };

const personSchema = { title: 'person', properties: { name: { type: 'string' }, username: { type: 'string' } } } as any;
const assetSchema = { title: 'asset', properties: { name: { type: 'string' } } } as any;

const group = (label: string, elements: IVeoFormSchemaItem[] = []): IVeoFormSchemaItem => ({
  type: 'Layout',
  options: { format: 'group', label },
  elements
});

const formSchema = (): IVeoFormSchemaItem => ({
  type: 'Layout',
  options: { format: 'group', direction: 'vertical' },
  elements: [group('first'), group('second'), group('third')]
});

describe('hasUserAssignment', () => {
  it('is true for person schemas that define a username', () => {
    expect(hasUserAssignment(personSchema)).toBe(true);
  });

  it('is false for other object types or persons without username', () => {
    expect(hasUserAssignment(assetSchema)).toBe(false);
    expect(hasUserAssignment({ title: 'person', properties: {} } as any)).toBe(false);
    expect(hasUserAssignment(undefined)).toBe(false);
  });
});

describe('injectUserAssignmentGroup', () => {
  it('inserts the group as the second element of person forms', () => {
    const result = injectUserAssignmentGroup(formSchema(), personSchema, labels);

    expect(result.elements?.map((element) => element.options.label)).toEqual([
      'first',
      labels.group,
      'second',
      'third'
    ]);
    const injected = result.elements?.[1] as IVeoFormSchemaItem;
    expect(injected.options.class).toBe(USER_ASSIGNMENT_GROUP_CLASS);
    expect(injected.elements).toEqual([{ type: 'Control', scope: USERNAME_SCOPE, options: { label: labels.control } }]);
  });

  it('does not modify the passed form schema', () => {
    const original = formSchema();
    injectUserAssignmentGroup(original, personSchema, labels);
    expect(original.elements).toHaveLength(3);
  });

  it('leaves forms of other object types untouched', () => {
    const original = formSchema();
    expect(injectUserAssignmentGroup(original, assetSchema, labels)).toBe(original);
  });

  it('supports custom positions and clamps them to the available elements', () => {
    expect(injectUserAssignmentGroup(formSchema(), personSchema, labels, 0).elements?.[0].options.label).toBe(
      labels.group
    );
    expect(injectUserAssignmentGroup(formSchema(), personSchema, labels, 10).elements?.[3].options.label).toBe(
      labels.group
    );
    expect(
      injectUserAssignmentGroup({ type: 'Layout', options: {} }, personSchema, labels).elements?.[0].options.label
    ).toBe(labels.group);
  });

  it('removes username controls that already exist in the form schema', () => {
    const usernameControl: IVeoFormSchemaItem = { type: 'Control', scope: USERNAME_SCOPE, options: {} };
    const schema: IVeoFormSchemaItem = {
      type: 'Layout',
      options: {},
      elements: [group('first', [usernameControl, { type: 'Control', scope: '#/properties/name', options: {} }])]
    };

    const result = injectUserAssignmentGroup(schema, personSchema, labels);

    expect(result.elements?.[0].elements?.map((element) => element.scope)).toEqual(['#/properties/name']);
    expect(result.elements?.[1].elements?.[0].scope).toBe(USERNAME_SCOPE);
  });
});

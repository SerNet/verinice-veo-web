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
import { cloneDeep } from 'lodash';
import type { JSONSchema7 } from 'json-schema';

import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';

export const USERNAME_SCOPE = '#/properties/username';
export const USER_ASSIGNMENT_GROUP_CLASS = 'veo-user-assignment-group';

export interface IUserAssignmentLabels {
  group: string;
  control: string;
}

export const hasUserAssignment = (objectSchema: JSONSchema7 | undefined): boolean =>
  objectSchema?.title === 'person' && !!objectSchema?.properties?.username;

export const createUserAssignmentGroup = (labels: IUserAssignmentLabels): IVeoFormSchemaItem => ({
  type: 'Layout',
  options: {
    format: 'group',
    direction: 'vertical',
    class: USER_ASSIGNMENT_GROUP_CLASS,
    label: labels.group
  },
  elements: [
    {
      type: 'Control',
      scope: USERNAME_SCOPE,
      options: {
        label: labels.control
      }
    }
  ]
});

const removeUsernameControls = (element: IVeoFormSchemaItem): IVeoFormSchemaItem => {
  if (!element.elements) {
    return element;
  }
  element.elements = element.elements
    .filter((child) => !(child.type === 'Control' && child.scope === USERNAME_SCOPE))
    .map(removeUsernameControls);
  return element;
};

export const injectUserAssignmentGroup = (
  formSchema: IVeoFormSchemaItem,
  objectSchema: JSONSchema7 | undefined,
  labels: IUserAssignmentLabels,
  index = 1
): IVeoFormSchemaItem => {
  if (!hasUserAssignment(objectSchema)) {
    return formSchema;
  }

  const result = removeUsernameControls(cloneDeep(formSchema));
  const elements = result.elements || [];
  elements.splice(Math.min(Math.max(index, 0), elements.length), 0, createUserAssignmentGroup(labels));
  result.elements = elements;
  return result;
};

/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize, Markus Werner, Jonas Heitmann
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
import { JsonPointer } from 'json-ptr';
import type { JSONSchema7 } from 'json-schema';

import { isEqual, isPlainObject } from 'lodash';
import type { IVeoFormSchema } from '~/composables/api/queryDefinitions/forms';
import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import type { IVeoCustomLink, IVeoDomainSpecificObjectSchema, IVeoEntity, IVeoObjectSchema } from '~/types/VeoTypes';

export const CHART_COLORS = ['#666', '#ffc107', '#3f51b5', '#8bc34a', '#bbb'];

// export const CHART_COLORS = ['#5c3f5a', '#304655', '#2892e4', '#8d9ac5', '#36384c'];

export interface IForm {
  objectSchema: JSONSchema7 | IVeoObjectSchema;
  formSchema?: IVeoFormSchema;
  objectData: Record<string, any> | IVeoEntity;
  lang?: Record<string, any>;
}

export function sanitizeURLParams(url: string) {
  return url.replaceAll(/([^\w-])/g, '');
}

export function extractSubTypesFromObjectSchema(
  schema: IVeoDomainSpecificObjectSchema
): { subType: string; status: string[] }[] {
  return (
    schema.allOf?.map((mapping) => ({
      subType: mapping.if.properties.subType.const,
      status: mapping.then.properties.status.enum
    })) || []
  );
}

export function getFirstDomainDomaindId(unit: IVeoUnit): string | undefined {
  const firstDomain = unit.domains?.[0];

  return firstDomain ? firstDomain.id : undefined;
}

export const dateIsValid = (date: Date) => date.toString() !== 'Invalid Date';

// Keys that don't have to be present in an object nor match in order to be equal
const IGNORED_KEYS: (string | RegExp)[] = [
  'decisionResults',
  /createdAt$/,
  /createdBy$/,
  /updatedAt$/,
  /updatedBy$/,
  /targetUri$/,
  /displayName$/
];

export const isObjectEqual = (objectA: IVeoEntity, objectB: IVeoEntity) => {
  // Turn both objects into flat maps so it's easier to compare them based on their keys
  const objectAFlatMap = JsonPointer.flatten(objectA, false);
  const objectBFlatMap = JsonPointer.flatten(objectB, false);

  // Find keys only present in one of both objects that aren't optional
  const objectAKeys = Object.keys(objectAFlatMap);
  const objectBKeys = Object.keys(objectBFlatMap);
  const missingKeysA = objectAKeys.filter((key) => !objectBKeys.includes(key));
  const missingKeysB = objectBKeys.filter((key) => !objectAKeys.includes(key));
  const missingKeys = [...missingKeysA, ...missingKeysB].filter(
    (key) => !IGNORED_KEYS.some((ignoredKey) => key.match(ignoredKey))
  );

  // Find mismatching values
  const mismatchingValues = Object.entries(objectAFlatMap)
    .filter(([key, value]) => {
      // If key is ignored, skip
      if (IGNORED_KEYS.some((ignoredKey) => key.match(ignoredKey))) {
        return false;
      }
      // If the key is missing in the other object, it is already unequal, no need to check for value difference.
      if (missingKeys.includes(key)) {
        return false;
      }
      // Returns false if the value is an object, as object keys will get checked anyways.
      if (isPlainObject(value)) {
        return false;
      }
      // If both conditions are true, the value is a custom link. As it isn't guaranteed that the links from the
      // history api are in the same order as from the default api, we use a custom comparator
      if (Array.isArray(value) && value[0]?.target) {
        return !isLinkEqual(value, objectBFlatMap[key] as IVeoCustomLink[]);
      }
      return !isEqual(value, objectBFlatMap[key]);
    })
    .map(([key, _value]) => key);

  return {
    isEqual: !missingKeys.length && !mismatchingValues.length,
    missingKeys,
    mismatchingValues
  };
};

const isLinkEqual = (linkA: IVeoCustomLink[], linkB: IVeoCustomLink[]) => {
  if (linkA.length !== linkB.length) {
    return false;
  }
  for (const link of linkA) {
    const correspondingLinkB = linkB.find((_link) => link.target?.targetUri === _link.target?.targetUri);
    // No need to compare target object, as the only relevant field is targetUri and correspondingLinkB would be undefined if the value doesn't exist
    if (
      !correspondingLinkB ||
      !isEqual(link.attributes, correspondingLinkB.attributes) ||
      !isEqual(link.domains, correspondingLinkB.domains)
    ) {
      return false;
    }
  }
  return true;
};

export const getFormSchemaControlType = (objectSchemaElement: JSONSchema7) => {
  // If attribute contains an enum, display as enum, regardless of enum value type.
  if (Array.isArray(objectSchemaElement.enum)) {
    return 'enum';
  }

  // If type isn't set or type is an array, return as default as we don't know how to handle it (likely a corrupt schema)
  if (!objectSchemaElement.type || Array.isArray(objectSchemaElement.type)) {
    return 'default';
  }

  return objectSchemaElement.type;
};

export const OBJECT_TYPE_SORT_ORDER = [
  'scope',
  'process',
  'asset',
  'person',
  'incident',
  'document',
  'control',
  'scenario'
];

export function getMostContrastyColor(backgroundColor: string) {
  const CONTRAST_THRESHOLD = 90;
  if (backgroundColor) {
    const hex = backgroundColor.substring(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return r * 0.299 + g * 0.587 + b * 0.114 > CONTRAST_THRESHOLD ? '#000000' : '#ffffff';
  } else {
    return '#000000';
  }
}

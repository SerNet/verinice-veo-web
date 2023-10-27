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
import { JSONSchema7 } from 'json-schema';
import { JsonPointer } from 'json-ptr';

import { isEqual, isPlainObject } from 'lodash';
import { IVeoCustomLink, IVeoEntity, IVeoLink, IVeoObjectSchema } from '~/types/VeoTypes';
import { IVeoFormSchema } from '~~/composables/api/queryDefinitions/forms';
import { IVeoUnit } from '~~/composables/api/queryDefinitions/units';

export const CHART_COLORS = ['#c90000', '#ffc107', '#3f51b5', '#8bc34a', '#858585'];
// export const CHART_COLORS = ['#5c3f5a', '#304655', '#2892e4', '#8d9ac5', '#36384c'];

export interface IForm {
  objectSchema: JSONSchema7 | IVeoObjectSchema;
  formSchema?: IVeoFormSchema;
  objectData: Record<string, any> | IVeoEntity;
  lang?: Record<string, any>;
}

export function getEntityDetailsFromLink(link: IVeoLink): { type: string; id: string; name: string } {
  const destructedLink = link.targetUri?.split('/');

  return {
    id: destructedLink?.pop() || '',
    type: destructedLink?.pop() || '',
    name: link.displayName || ''
  };
}

export function sanitizeURLParams(url: string) {
  return url.replaceAll(/(\/|[^\w-])/g, '');
}

export function extractSubTypesFromObjectSchema(schema: IVeoObjectSchema): { subType: string; status: string[] }[] {
  return (
    schema.allOf?.map((mapping) => ({
      subType: mapping.if.properties.subType.const,
      status: mapping.then.properties.status.enum
    })) || []
  );
}

export function getFirstDomainDomaindId(unit: IVeoUnit): string | undefined {
  const firstDomain = unit.domains?.[0];

  return firstDomain ? getEntityDetailsFromLink(firstDomain).id : undefined;
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
  /searchesUri$/,
  /resourcesUri$/,
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
  const missingKeys = [...missingKeysA, ...missingKeysB].filter((key) => !IGNORED_KEYS.some((ignoredKey) => key.match(ignoredKey)));

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

  return { isEqual: !missingKeys.length && !mismatchingValues.length, missingKeys, mismatchingValues };
};

const isLinkEqual = (linkA: IVeoCustomLink[], linkB: IVeoCustomLink[]) => {
  if (linkA.length !== linkB.length) {
    return false;
  }
  for (const link of linkA) {
    const correspondingLinkB = linkB.find((_link) => link.target?.targetUri === _link.target?.targetUri);
    // No need to compare target object, as the only relevant field is targetUri and correspondingLinkB would be undefined if the value doesn't exist
    if (!correspondingLinkB || !isEqual(link.attributes, correspondingLinkB.attributes) || !isEqual(link.domains, correspondingLinkB.domains)) {
      return false;
    }
  }
  return true;
};

export const getFormSchemaControlType = ((objectSchemaElement: JSONSchema7) => {
  // If attribute contains an enum, display as enum, regardless of enum value type.
  if(Array.isArray(objectSchemaElement.enum)) {
    return 'enum';
  }

  // If type isn't set or type is an array, return as default as we don't know how to handle it (likely a corrupt schema)
  if(!objectSchemaElement.type || Array.isArray(objectSchemaElement.type)) {
    return 'default';
  }

  return objectSchemaElement.type;
});

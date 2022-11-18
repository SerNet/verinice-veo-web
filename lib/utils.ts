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

import { IVeoEntity, IVeoFormSchema, IVeoLink, IVeoObjectSchema, IVeoUnit } from '~/types/VeoTypes';

export const CHART_COLORS = ['#c90000', '#ffc107', '#3f51b5', '#8bc34a', '#858585'];

export interface IBaseObject {
  [key: string]: any;
}

export interface IForm {
  objectSchema: JSONSchema7 | IVeoObjectSchema;
  formSchema?: IVeoFormSchema;
  objectData: IBaseObject | IVeoEntity;
  lang?: IBaseObject;
}

interface IUUIDParam {
  type: string;
  id: string;
}

export function createUUIDUrlParam(type: string, UUID: string): string {
  // UUID is exactly 36 characters long
  // If it exactly 36 characters long (raw UUID), than add type to it, else return it directly, because type is already in it
  return UUID.length !== 36 ? UUID : `${type}-${UUID}`;
}

export function separateUUIDParam(param: string | undefined): IUUIDParam {
  // if param is not defined, make it string; TODO: check if this can cause bugs
  const stringParam = param || '';
  // returns id with 36 characters from the structure type-UUID
  const id = stringParam.slice(-36);
  return {
    type: stringParam.replace(`-${id}`, ''),
    id
  };
}

export function getEntityDetailsFromLink(link: IVeoLink): { type: string; id: string; name: string } {
  const destructedLink = link.targetUri.split('/');

  return {
    id: destructedLink.pop() || '',
    type: destructedLink.pop() || '',
    name: link.displayName || ''
  };
}

export function sanitizeURLParams(url: string) {
  return url.replaceAll(/(\/|[^\w-])/g, '');
}

export function extractSubTypesFromObjectSchema(schema: IVeoObjectSchema): { subType: string; status: string[] }[] {
  return (
    Object.values(schema.properties.domains.properties)[0]?.allOf?.map((mapping) => ({
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
const IGNORED_KEYS: (string | RegExp)[] = [/createdAt$/, /createdBy$/, /updatedAt$/, /updatedBy$/, /searchesUri$/, /resourcesUri$/, /displayName$/];

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
      return value !== objectBFlatMap[key];
    })
    .map(([key, _value]) => key);

  return { isEqual: !missingKeys.length && !mismatchingValues.length, missingKeys, mismatchingValues };
};

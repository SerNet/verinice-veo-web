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

export function createUUIDUrlParam(type: string, UUID: string): string {
  // UUID is exactly 36 characters long
  // If it exactly 36 characters long (raw UUID), than add type to it, else return it directly, because type is already in it
  return UUID.length !== 36 ? UUID : `${type}-${UUID}`;
}

interface IUUIDParam {
  type: string;
  id: string;
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

export function formatDate(date: Date) {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
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

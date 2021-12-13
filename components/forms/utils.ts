/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize, Jonas Heitmann
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
import Ajv2019 from 'ajv/dist/2019';
import addFormats from 'ajv-formats';
import { JsonPointer } from 'json-ptr';
import { UIRule, UISchema, UISchemaElement } from '~/types/UISchema';
import { IBaseObject } from '~/lib/utils';
import { IVeoEntity, IVeoPaginatedResponse } from '~/types/VeoTypes';

type defaultType = string | boolean | number | undefined | null;

export interface BaseObject {
  [key: string]: any;
}

export interface ILinksFieldDialogNewObject {
  name?: string;
  abbreviation?: string;
  description?: string;
  subType?: { [key: string]: string };
  domains?: { targetUri: string }[];
}

export interface ILinksFieldDialogUpdatedObject extends ILinksFieldDialogNewObject, BaseObject {
  name?: string;
  abbreviation?: string;
  description?: string;
  // TODO: activate after displayName is implemented
  // displayName: string
  id: string;
}

// Nuxt compile throws warnings if this is no default export exists
export default {};

export interface IApi {
  fetchAll(objectType: string, searchParams?: IBaseObject): Promise<IVeoPaginatedResponse<IVeoEntity[]>>;
  create(objectType: string, createdObjectData: IVeoEntity): Promise<BaseObject>;
  update(objectType: string, updatedObjectData: ILinksFieldDialogUpdatedObject): Promise<void>;
  delete(objectType: string, id: string): Promise<void>;
}

export function isContain(array: defaultType[], elementToContain: defaultType[] | defaultType) {
  if (Array.isArray(elementToContain)) {
    // Check if every element of elementToContain is in array included
    return elementToContain.every((el) => array.includes(el));
  } else {
    return array.includes(elementToContain);
  }
}

export const linksFieldDialogObjectSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    abbreviation: {
      type: 'string'
    },
    description: {
      type: 'string'
    }
  }
};

export const linksFieldDialogFormSchema: UISchema = {
  type: 'Layout',
  options: {
    format: 'group',
    direction: 'vertical'
  },
  elements: [
    {
      type: 'Control',
      scope: '#/properties/name',
      options: {
        label: '#lang/name'
      }
    },
    {
      type: 'Control',
      scope: '#/properties/abbreviation',
      options: {
        label: '#lang/abbreviation'
      }
    },
    {
      type: 'Control',
      scope: '#/properties/description',
      options: {
        label: '#lang/description'
      }
    }
  ]
};

// Evaluate Rule
export const ajv = new Ajv2019({
  allErrors: true
});
addFormats(ajv);

export function propertyPath(path: string) {
  // TODO: Better translation from #/properties/name to #/name for values
  return String(path || '').replace(/\/properties\//g, '/');
}

export interface IRule {
  visible: boolean;
  disabled: boolean;
}

export function evaluateRule(value: any, rule: UIRule | undefined) {
  const defaults = {
    visible: true,
    disabled: false
  };
  if (!rule) {
    return defaults;
  }

  if (!['HIDE', 'SHOW', 'DISABLE', 'ENABLE'].includes(rule.effect)) {
    // eslint-disable-next-line no-console
    console.error(`Your rule effect "${rule.effect}" is not available!`, 'Only these rule effects are permitted: "SHOW", "HIDE", "ENABLED", "DISABLED".');
    return defaults;
  }

  const v = JsonPointer.get(value, propertyPath(rule.condition.scope));

  // if rule condition is true
  if (ajv.validate(rule.condition.schema, v)) {
    switch (rule.effect) {
      case 'HIDE':
        return { ...defaults, visible: false };
      case 'SHOW':
        return { ...defaults, visible: true };
      case 'DISABLE':
        return { ...defaults, disabled: true };
      case 'ENABLE':
        return { ...defaults, disabled: false };
    }
  } else {
    // if rule condition is false
    // This means that SHOW and ENANBLE must be deactivated, because of above defined defaults
    switch (rule.effect) {
      case 'HIDE':
        return { ...defaults };
      case 'SHOW':
        return { ...defaults, visible: false };
      case 'DISABLE':
        return { ...defaults };
      case 'ENABLE':
        return { ...defaults, disabled: true };
    }
  }
}

// Generate Formschema
export enum Mode {
  GENERAL = 'GENERAL',
  VEO = 'VEO'
}

function generateControl(scope: string, items: BaseObject, mode: Mode = Mode.GENERAL): UISchemaElement {
  const propertyName = scope.split('/').pop();
  const label = propertyName ? (mode === Mode.VEO ? `#lang/${propertyName}` : propertyName) : '';
  return {
    type: 'Control',
    scope,
    options: {
      label
    },
    // Add property only if condition(here: items[scope]) is true https://stackoverflow.com/a/40560953/6072503
    ...(items[scope] && {
      elements: items[scope].map(generateControl)
    })
  };
}

function generateGroups(content: UISchemaElement[], scopes: string[]) {
  const regCustomAspect = /#\/properties\/customAspects\/properties\/\w+/;
  const uniqueCustomAspects = [
    ...new Set(
      scopes
        .filter((scope) => scope.includes('#/properties/customAspects/properties'))
        .map((scope) => {
          const matchedCustomAspect = scope.match(regCustomAspect);
          return matchedCustomAspect && matchedCustomAspect[0];
        })
    )
  ] as string[];

  return [
    ...content.filter((el: any) => el.scope && !regCustomAspect.test(el.scope)),
    ...uniqueCustomAspects.map((uniqueCustomAspect) => {
      return {
        type: 'Layout',
        options: {
          type: 'group',
          direction: 'vertical',
          class: 'border'
        },
        elements: [
          {
            type: 'Label',
            text: uniqueCustomAspect.split('/').pop(),
            options: { class: 'font-italic accent--text text-body-2 ml-3' }
          },
          ...content.filter((el: any) => el.scope && el.scope.includes(uniqueCustomAspect))
        ]
      };
    })
  ] as UISchemaElement[];
}

export function generateFormSchema(objectSchema: JSONSchema7, excludedProperties: string[] = [], mode: Mode = Mode.GENERAL): any {
  const items: BaseObject = {};
  // @ts-ignore
  let schemaMap = Object.keys(JsonPointer.flatten(objectSchema, '#'));
  const excludedPropertiesRegexp = excludedProperties.map((prop) => new RegExp(prop));
  schemaMap = excludedPropertiesRegexp.length > 0 ? schemaMap.filter((el) => !excludedPropertiesRegexp.some((reg) => reg.test(el))) : schemaMap;
  // Regex explanation: Match all paths containing either /properties/<smth> (custom aspect/link attributes) or /properties/<uuid>/properties/<smth> (currently only used for domain properties (subType & status))
  const scopes = schemaMap
    .filter((el) => /#\/(\w|\/)*properties\/\w+$/g.test(el) || /#\/(\w|\/)*properties\/(.[^/]*)\/properties\/\w+$/g.test(el))
    .filter((el, _, arr) => !arr.some((someEl) => new RegExp(String.raw`${el}/properties/\w+`, 'g').test(someEl)))
    .filter((el) => {
      // Regex explanation: Match all custom link attributes, but set them in context with their parent
      if (/\/properties\/\w+\/items\/properties\/\w+$/g.test(el)) {
        const [parent, child] = el.split(/\/items(?=\/properties\/\w+$)/g);
        items[parent] = items[parent] ? [...items[parent], `#${child}`] : [`#${child}`];
        return false;
      } else {
        return true;
      }
    });
  let content = scopes.map((scope) => generateControl(scope, items, mode));

  // Generate Groups for each customAspect
  // TODO: should be added the same for links
  content = generateGroups(content, scopes);
  return {
    type: 'Layout',
    options: {
      format: 'group',
      direction: 'vertical'
    },
    elements: content
  };
}

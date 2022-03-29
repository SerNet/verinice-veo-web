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
import { merge, partition } from 'lodash';
import { UIRule, UISchemaElement, IVeoFormSchemaControl } from '~/types/UISchema';
import { IVeoFormSchemaGeneratorOptions } from '~/types/VeoTypes';

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

export function isContain(array: defaultType[], elementToContain: defaultType[] | defaultType) {
  if (Array.isArray(elementToContain)) {
    // Check if every element of elementToContain is in array included
    return elementToContain.every((el) => array.includes(el));
  } else {
    return array.includes(elementToContain);
  }
}

// Evaluate Rule
export const ajv = new Ajv2019({
  allErrors: true,
  strict: false // ToDo: Currently the process schema isn't adhering to the json schema standard, so we disable strict mode to prevent errors beeing shown
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

function isGroup(schema: JSONSchema7): boolean {
  return !!schema.properties;
}

function isPropertyExcludedFromFormSchema(pointer: string, excludedProperties: string[]): boolean {
  const excludedPropertiesRegexp = excludedProperties.map((prop) => new RegExp(prop));

  return excludedPropertiesRegexp.some((regexp) => regexp.test(pointer));
}

export function generateFormSchemaGroup(children: UISchemaElement[], label?: string): UISchemaElement {
  const labelElement = label
    ? {
        type: 'Label',
        text: label,
        options: { class: 'font-italic accent--text text-body-2 ml-3' }
      }
    : undefined;

  return {
    type: 'Layout',
    options: {
      class: 'border',
      direction: 'vertical'
    },
    elements: [...(labelElement ? [labelElement as any] : []), ...children]
  };
}

export function generateFormSchemaControl(pointer: string, schema: BaseObject, mode: Mode): IVeoFormSchemaControl {
  const propertyName = pointer.split('/').pop();
  const label = propertyName ? (mode === Mode.VEO ? `#lang/${propertyName}` : propertyName) : '';

  return {
    type: 'Control',
    scope: pointer,
    options: {
      label
    },
    ...(schema?.items?.required?.includes('target') ? { elements: [] } : {})
  };
}

function generateFormSchemaControls(pointer: string, schema: JSONSchema7, generatorOptions: IVeoFormSchemaGeneratorOptions, mode: Mode = Mode.GENERAL): any[] {
  const controls: IVeoFormSchemaControl[] = [];

  if (isPropertyExcludedFromFormSchema(pointer, generatorOptions.excludedProperties as string[])) {
    return [];
  }

  if (!isGroup(schema)) {
    controls.push(generatorOptions.generateControlFunction(pointer, schema, mode));
  } else {
    const properties = schema.properties || {};
    for (const property of Object.keys(properties)) {
      controls.push(...generateFormSchemaControls(`${pointer}/properties/${property}`, properties[property] as any, generatorOptions, mode));
    }
  }

  return controls;
}

export function generateFormSchema(objectSchema: JSONSchema7, generatorOptions: IVeoFormSchemaGeneratorOptions, mode: Mode = Mode.GENERAL): any {
  const _generatorOptions = merge({ excludedProperties: [] as string[], groupedNamespaces: [] as string[] }, generatorOptions);
  let schema: UISchemaElement[] = generateFormSchemaControls('#', objectSchema, _generatorOptions, mode);

  for (const namespace of _generatorOptions.groupedNamespaces) {
    const [controlsToAddToGroup, untouchedControls] = partition(schema, (control) => new RegExp(namespace.namespace).test((control as any).scope || ''));
    schema = [...untouchedControls, generatorOptions.generateGroupFunction(controlsToAddToGroup, namespace.label)];
  }

  const formSchema = generatorOptions.generateGroupFunction(schema);
  delete formSchema.options?.class;

  return formSchema;
}

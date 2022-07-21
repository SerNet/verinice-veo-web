/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
import { PropType } from '@nuxtjs/composition-api';
import { JsonPointer } from 'json-ptr';
import Ajv2019 from 'ajv/dist/2019';
import addFormats from 'ajv-formats';
import { cloneDeep, dropRight, merge, partition, pull } from 'lodash';
import { JSONSchema7 } from 'json-schema';

import { IVeoFormElementFormSchemaRule, IVeoFormElementRule, IVeoFormsTranslations } from './types';
import { IBaseObject } from '~/lib/utils';
import { IVeoFormSchemaControl, UISchemaElement } from '~/types/UISchema';
import { IVeoFormSchemaGeneratorOptions } from '~/types/VeoTypes';

export default {};

export const VeoFormsElementProps = {
  metaData: {
    type: Object as PropType<IBaseObject>,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  objectCreationDisabled: {
    type: Boolean,
    default: false
  },
  translations: {
    type: Object as PropType<IVeoFormsTranslations>,
    default: () => {}
  },
  debug: {
    type: Boolean,
    default: false
  },
  formSchemaPointer: {
    type: String,
    required: true
  },
  options: {
    type: Object as PropType<IBaseObject & IVeoFormElementRule>,
    default: () => {}
  }
};

export const VeoFormsWidgetProps = {
  ...VeoFormsElementProps,
  name: {
    type: String,
    required: true
  },
  objectData: {
    type: Object as PropType<IBaseObject>,
    default: () => {}
  }
};

export const VeoFormsControlProps = {
  ...VeoFormsElementProps,
  objectSchemaPointer: {
    type: String,
    default: '',
    required: true
  },
  objectSchema: {
    type: Object as PropType<JSONSchema7>,
    default: () => {},
    required: true
  },
  value: {
    type: [Number, String, Object, Array, Boolean],
    default: undefined
  },
  errors: {
    type: Map as PropType<Map<String, String[]>>,
    default: () => {}
  },
  // Marks this control as being part of a link (and gets passed in the onInput call. Usually gets set in the background by the VeoLinksFieldRowAttribute component)
  index: {
    type: Number,
    default: undefined
  },
  items: {
    type: Array as PropType<{ text: string; value: any }[]>,
    default: () => []
  }
};

export const ajv = new Ajv2019({
  allErrors: true,
  strict: true
});
addFormats(ajv);

export const removePropertiesKeywordFromPath = (path: string) => {
  // TODO: Better translation from #/properties/name to #/name for values
  return String(path || '').replace(/\/properties\//g, '/');
};

export const evaluateRule = (value: any, rule: IVeoFormElementFormSchemaRule | undefined): IVeoFormElementRule => {
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

  const v = JsonPointer.get(value, removePropertiesKeywordFromPath(rule.condition.scope));

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
};

// Conditionally apply properties
const getParentPointer = (elementPointer: string): string => {
  const parentParts = elementPointer.split('/');
  return dropRight(parentParts, 2).join('/');
};

export const addConditionalSchemaPropertiesToControlSchema = (objectSchema: JSONSchema7, objectData: any, controlObjectSchema: JSONSchema7, pointer: string) => {
  let schema = cloneDeep(controlObjectSchema);

  const controlName = pointer.split('/').pop() as string;
  // Search for conditionally applied properties of the new control (based in the parent object in the objectschema)
  const parentPointer = getParentPointer(pointer);
  const parentSchema: any = JsonPointer.get(objectSchema, parentPointer);

  if (parentSchema) {
    const getSchemaCompositionConditions = (schemaCompositionObject: any) =>
      schemaCompositionObject?.filter((condition: any) => condition.then?.properties?.[controlName] || condition.else?.properties?.[controlName]) || [];

    const conditionsToCheck = [
      ...(parentSchema.then?.properties?.[controlName] || parentSchema.else?.properties?.[controlName] ? [parentSchema] : []),
      ...getSchemaCompositionConditions(parentSchema.allOf),
      ...getSchemaCompositionConditions(parentSchema.AnyOf),
      ...getSchemaCompositionConditions(parentSchema.OneOf)
    ];

    for (const condition of conditionsToCheck) {
      schema = getSchemaWithAppliedConditionalSchemaProperties(objectData, schema, condition, parentPointer, controlName);
    }
  }

  return schema;
};

const getSchemaWithAppliedConditionalSchemaProperties = (
  objectData: any,
  controlObjectSchema: JSONSchema7,
  ifElseThenBlock: { if?: any; else?: any; then?: any },
  parentPointer: string,
  controlName: string
) => {
  let schema;
  for (const propertyWithCondition of Object.keys(ifElseThenBlock.if?.properties)) {
    const pathInFormDataParts = pull(parentPointer.split('/'), 'properties', 'attributes');
    pathInFormDataParts.push(propertyWithCondition);
    const pathInFormData = pathInFormDataParts.join('/');

    if (JsonPointer.get(objectData, pathInFormData) === ifElseThenBlock.if.properties[propertyWithCondition].const) {
      schema = merge(controlObjectSchema, ifElseThenBlock.then?.properties?.[controlName]);
    } else {
      schema = merge(controlObjectSchema, ifElseThenBlock.else?.properties?.[controlName]);
    }
  }
  return schema;
};

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
        options: { class: 'font-italic accent--text text-body-2' }
      }
    : undefined;

  return {
    type: 'Layout',
    options: {
      class: 'veo-generated-fs-group-border',
      direction: 'vertical'
    },
    elements: [...(labelElement ? [labelElement as any] : []), ...children]
  };
}

export function generateFormSchemaControl(pointer: string, schema: IBaseObject, mode: Mode): IVeoFormSchemaControl {
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

export const getControlErrorMessages = (props: any, modifier: string = '') =>
  props.index !== undefined
    ? props.errors.get(props.objectSchemaPointer.replace('/items/', `/${props.index}/`) + modifier)
    : props.errors.get(props.objectSchemaPointer + modifier);

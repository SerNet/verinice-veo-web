/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann, jae
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
import { PropType } from 'vue';
import { JsonPointer } from 'json-ptr';
import Ajv2019 from 'ajv/dist/2019';
import addFormats from 'ajv-formats';
import { cloneDeep, dropRight, merge, partition, pull } from 'lodash';
import { JSONSchema7 } from 'json-schema';

import { IDynamicFormElementOptions, IVeoFormElementFormSchemaRule, IVeoFormElementRule } from './types';
import { IVeoFormSchemaControl, UISchemaElement } from '~/types/UISchema';
import { IVeoFormSchemaGeneratorOptions } from '~/types/VeoTypes';

export const VeoFormsElementProps = {
  metaData: {
    type: Object as PropType<Record<string, any>>,
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
  debug: {
    type: Boolean,
    default: false
  },
  formSchemaPointer: {
    type: String,
    required: true
  },
  options: {
    type: Object as PropType<IDynamicFormElementOptions>,
    default: () => ({})
  }
};

export const VeoFormsWidgetProps = {
  ...VeoFormsElementProps,
  name: {
    type: String,
    required: true
  }
};

export const VeoFormsControlProps = {
  ...VeoFormsElementProps,
  // Points to the definition of this control in the object schema
  objectSchemaPointer: {
    type: String,
    default: '',
    required: true
  },
  // Complete object schema
  objectSchema: {
    type: Object as PropType<JSONSchema7>,
    default: () => ({}),
    required: true
  },
  // Points to where the value can be found in the object (usually the object schema pointer without /properties, however if the control is part of a custom link, the index omes into play)
  valuePointer: {
    type: String,
    default: '',
    required: true
  },
  // The value of this control. Might get modified in the Control.ts if control is part of a custom link.
  modelValue: {
    type: [Number, String, Object, Array, Boolean],
    default: undefined
  },
  // Map containing all errors present in the form
  errors: {
    type: Map as PropType<Map<string, string[]>>,
    default: () => ({})
  },
  // Marks this control as being part of a link (and gets passed in the onInput call. Usually gets set in the background by the VeoLinksFieldRowAttribute component)
  index: {
    type: Number,
    default: undefined
  },
  // Contains all items available in VeoAutocomplete, VeoSelect and VeoRadio
  items: {
    type: Array as PropType<{ title: string; value: any }[]>,
    default: () => []
  },
  // Used by vue the identify each Node so that it only gets repainted if the key changes. Makes forms more performant
  elementKey: {
    type: String,
    required: true
  }
};

export const ajv = new Ajv2019({
  allErrors: true,
  strict: false
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
    console.error(
      `Your rule effect "${rule.effect}" is not available!`,
      'Only these rule effects are permitted: "SHOW", "HIDE", "ENABLED", "DISABLED".'
    );
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

export const addConditionalSchemaPropertiesToControlSchema = (
  objectSchema: JSONSchema7,
  objectData: any,
  controlObjectSchema: JSONSchema7,
  pointer: string
) => {
  let schema = cloneDeep(controlObjectSchema);

  const controlName = pointer.split('/').pop() as string;
  // Search for conditionally applied properties of the new control (based in the parent object in the objectschema)
  const parentPointer = getParentPointer(pointer);
  const parentSchema: any = JsonPointer.get(objectSchema, parentPointer);

  if (parentSchema) {
    const getSchemaCompositionConditions = (schemaCompositionObject: any) =>
      schemaCompositionObject?.filter(
        (condition: any) => condition.then?.properties?.[controlName] || condition.else?.properties?.[controlName]
      ) || [];

    const conditionsToCheck = [
      ...(parentSchema.then?.properties?.[controlName] || parentSchema.else?.properties?.[controlName] ?
        [parentSchema]
      : []),
      ...getSchemaCompositionConditions(parentSchema.allOf),
      ...getSchemaCompositionConditions(parentSchema.AnyOf),
      ...getSchemaCompositionConditions(parentSchema.OneOf)
    ];

    for (const condition of conditionsToCheck) {
      schema = getSchemaWithAppliedConditionalSchemaProperties(
        objectData,
        schema,
        condition,
        parentPointer,
        controlName
      );
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
  const labelElement =
    label ?
      {
        type: 'Label',
        text: label,
        options: { class: 'font-italic text-accent text-body-2' }
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

export function generateFormSchemaControl(
  pointer: string,
  schema: Record<string, any>,
  mode: Mode
): IVeoFormSchemaControl {
  const propertyName = pointer.split('/').pop();
  const label =
    propertyName ?
      mode === Mode.VEO ?
        `#lang/${propertyName}`
      : propertyName
    : '';

  return {
    type: 'Control',
    scope: pointer,
    options: {
      label
    },
    ...(schema?.items?.required?.includes('target') ? { elements: [] } : {})
  };
}

function generateFormSchemaControls(
  pointer: string,
  schema: JSONSchema7,
  generatorOptions: IVeoFormSchemaGeneratorOptions,
  mode: Mode = Mode.GENERAL
): any[] {
  const controls: IVeoFormSchemaControl[] = [];

  if (isPropertyExcludedFromFormSchema(pointer, generatorOptions.excludedProperties as string[])) {
    return [];
  }

  if (!isGroup(schema)) {
    controls.push(generatorOptions.generateControlFunction(pointer, schema, mode));
  } else {
    const properties = schema.properties || {};
    for (const property of Object.keys(properties)) {
      controls.push(
        ...generateFormSchemaControls(
          `${pointer}/properties/${property}`,
          properties[property] as any,
          generatorOptions,
          mode
        )
      );
    }
  }

  return controls;
}

export function generateFormSchema(
  objectSchema: JSONSchema7,
  generatorOptions: IVeoFormSchemaGeneratorOptions,
  mode: Mode = Mode.GENERAL
): any {
  const _generatorOptions = merge(
    { excludedProperties: [] as string[], groupedNamespaces: [] as string[] },
    generatorOptions
  );
  let schema: UISchemaElement[] = generateFormSchemaControls('#', objectSchema, _generatorOptions, mode);

  for (const namespace of _generatorOptions.groupedNamespaces) {
    const [controlsToAddToGroup, untouchedControls] = partition(schema, (control) =>
      new RegExp(namespace.namespace).test((control as any).scope || '')
    );
    schema = [...untouchedControls, generatorOptions.generateGroupFunction(controlsToAddToGroup, namespace.label)];
  }

  const formSchema = generatorOptions.generateGroupFunction(schema);
  delete formSchema.options?.class;

  return formSchema;
}

export const getControlErrorMessages = (props: any, modifier = '') => {
  // Handle link elements (link elements have an index prop)
  if (props.index !== undefined && props.objectSchemaPointer.includes('/items/')) {
    return props.errors.get(props.objectSchemaPointer.replace('/items/', `/${props.index}/`) + modifier);
  }

  // Handle everything else
  return props.errors.get(props.objectSchemaPointer + modifier);
};

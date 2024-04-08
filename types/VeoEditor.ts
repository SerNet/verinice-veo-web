/*
 * verinice.veo web
 * Copyright (C) 2021  Davit Svandize
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
import {
  mdiAlphabeticalVariant,
  mdiCancel,
  mdiCheckboxOutline,
  mdiDecimal,
  mdiFileTree,
  mdiHelpBox,
  mdiLabelOutline,
  mdiNumeric,
  mdiViewList
} from '@mdi/js';
import { JSONSchema7 } from 'json-schema';

import { IVeoFormSchemaItem, IVeoFormSchemaItemOptions } from './VeoTypes';
import { CONTROL_DEFINITION as AUTOCOMPLETE_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/Autocomplete';
import { CONTROL_DEFINITION as CHECKBOX_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/Checkbox';
import { CONTROL_DEFINITION as INPUT_DATE_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/InputDate';
import { CONTROL_DEFINITION as INPUT_DATE_TIME_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/InputDateTime';
import { CONTROL_DEFINITION as INPUT_NUMBER_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/InputNumber';
import { CONTROL_DEFINITION as INPUT_TEXT_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/InputText';
import { CONTROL_DEFINITION as INPUT_TEXT_MULTILINE_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/InputTextMultiline';
import { CONTROL_DEFINITION as INPUT_URI_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/InputUri';
import { CONTROL_DEFINITION as LINKS_FIELD_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/LinksField';
import { CONTROL_DEFINITION as MARKDOWN_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/MarkdownEditor';
import { CONTROL_DEFINITION as RADIO_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/Radio';
import { CONTROL_DEFINITION as SELECT_CONTROL_DEFINITION } from '~/components/dynamic-form/controls/Select';

// ===============================
// File containing multiple helper classes for the object and form schema editors
// ===============================

/**
 * Defines how an element should be styled in the editors.
 */
export interface IInputType {
  name: string;
  color: string;
  icon: string;
}

/**
 * Dictionary containing all type name for the object schema with additional styling information
 */
export type IInputTypes = Record<string, IInputType>;

export const INPUT_TYPES = {
  string: { icon: mdiAlphabeticalVariant, name: 'string', color: 'red' },
  boolean: { icon: mdiCheckboxOutline, name: 'boolean', color: 'teal' },
  object: { icon: mdiFileTree, name: 'object', color: 'indigo' },
  number: { icon: mdiDecimal, name: 'number', color: '#add8e6' },
  integer: { icon: mdiNumeric, name: 'integer', color: 'green' },
  array: { icon: mdiViewList, name: 'array', color: '#ffbf00' },
  enum: { icon: mdiLabelOutline, name: 'enum', color: '#90ee90' },
  null: { icon: mdiCancel, name: 'null', color: 'blue-grey' },
  default: { icon: mdiHelpBox, name: 'unknown', color: 'grey' }
} as IInputTypes;

/**
 * All information a form element carries in the form schema editor
 */
export interface IControlElementContext {
  schema: JSONSchema7;
  options: IVeoFormSchemaItemOptions;
  elements?: IVeoFormSchemaItem[];
}

/**
 * Object containing information for all veo forms control elements
 */
export interface IControlElement {
  alternatives: string[]; // Alternatives are only checked for "parent" controls, meaning controls that have no options object (inputText, select, ...)
  applicableAlternative?: (elementToReplace: IControlElementContext) => boolean;
  code: string;
  description: Record<string, string>;
  name: Record<string, string>;
  options?: IVeoFormSchemaItemOptions;
  type: string[];
  weight: (weights: IControlElementContext) => number;
}

export type IControlElementType = Pick<IControlElement, 'code' | 'name' | 'description'>;

/**
 * Const array defining all possible control types and when which input type shall be used
 */
export const INPUT_ELEMENTS = [
  {
    code: 'Autocomplete',
    description: AUTOCOMPLETE_CONTROL_DEFINITION.description,
    name: AUTOCOMPLETE_CONTROL_DEFINITION.name,
    options: { format: 'autocomplete' },
    type: ['undefined', 'enum', 'array'],
    weight: (weights) =>
      calculateConditionsScore([
        typeof weights.schema.type === 'undefined' ||
          weights.schema.type === 'string' ||
          weights.schema.type === 'integer' ||
          weights.schema.type === 'number' ||
          weights.schema.type === 'array',
        typeof weights.schema.enum !== 'undefined' ||
          (weights.schema.items instanceof Object &&
            !Array.isArray(weights.schema.items) &&
            typeof weights.schema.items.enum !== 'undefined'),
        typeof weights.options !== 'undefined' && weights.options.format === 'autocomplete'
      ])
  },
  {
    code: 'Checkbox',
    description: CHECKBOX_CONTROL_DEFINITION.description,
    name: CHECKBOX_CONTROL_DEFINITION.name,
    type: ['boolean'],
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'boolean'])
  },
  {
    code: 'InputDate',
    description: INPUT_DATE_CONTROL_DEFINITION.description,
    name: INPUT_DATE_CONTROL_DEFINITION.name,
    type: ['string'],
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'string', weights.schema.format === 'date'])
  },
  {
    code: 'InputDateTime',
    description: INPUT_DATE_TIME_CONTROL_DEFINITION.description,
    name: INPUT_DATE_TIME_CONTROL_DEFINITION.name,
    type: ['string'],
    weight: (weights) =>
      calculateConditionsScore([weights.schema.type === 'string', weights.schema.format === 'date-time'])
  },
  {
    code: 'InputNumber',
    description: INPUT_NUMBER_CONTROL_DEFINITION.description,
    name: INPUT_NUMBER_CONTROL_DEFINITION.name,
    type: ['number', 'integer'],
    weight: (weights) =>
      calculateConditionsScore([weights.schema.type === 'number' || weights.schema.type === 'integer'])
  },
  {
    alternatives: ['InputTextMultiline', 'MarkdownEditor'],
    code: 'InputText',
    description: INPUT_TEXT_CONTROL_DEFINITION.description,
    name: INPUT_TEXT_CONTROL_DEFINITION.name,
    type: ['string'],
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'string'], Number.EPSILON)
  },
  {
    code: 'InputTextMultiline',
    description: INPUT_TEXT_MULTILINE_CONTROL_DEFINITION.description,
    name: INPUT_TEXT_MULTILINE_CONTROL_DEFINITION.name,
    options: { format: 'multiline' },
    type: ['string'],
    weight: (weights) =>
      calculateConditionsScore([
        weights.schema.type === 'string',
        typeof weights.options !== 'undefined' && weights.options.format === 'multiline'
      ])
  },
  {
    code: 'InputUri',
    description: INPUT_URI_CONTROL_DEFINITION.description,
    name: INPUT_URI_CONTROL_DEFINITION.name,
    type: ['string'],
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'string', weights.schema.format === 'uri'])
  },
  {
    code: 'LinksField',
    description: LINKS_FIELD_CONTROL_DEFINITION.description,
    name: LINKS_FIELD_CONTROL_DEFINITION.name,
    options: { format: 'group', direction: 'vertical' },
    type: ['array'],
    weight: (weights) => {
      const schemaItemsProperties =
        weights.schema &&
        weights.schema.items &&
        typeof weights.schema.items === 'object' &&
        !Array.isArray(weights.schema.items) &&
        weights.schema.items.properties &&
        weights.schema.items.properties;
      const isTarget = !!(schemaItemsProperties && schemaItemsProperties.target);
      return calculateConditionsScore([
        weights.schema.type === 'array',
        typeof weights.elements !== 'undefined',
        isTarget
      ]);
    }
  },
  {
    code: 'MarkdownEditor',
    description: MARKDOWN_CONTROL_DEFINITION.description,
    name: MARKDOWN_CONTROL_DEFINITION.name,
    options: { format: 'markdown' },
    type: ['string'],
    weight: (weights) =>
      calculateConditionsScore([
        weights.schema.type === 'string',
        typeof weights.options !== 'undefined' && weights.options.format === 'markdown'
      ])
  },
  {
    applicableAlternative: (currentType) => {
      return !currentType.schema.type || currentType.schema.type !== 'array';
    },
    code: 'Radio',
    description: RADIO_CONTROL_DEFINITION.description,
    name: RADIO_CONTROL_DEFINITION.name,
    options: {
      format: 'radio',
      direction: 'vertical'
    },
    type: ['undefined', 'enum', 'array'],
    weight: (weights) =>
      calculateConditionsScore([
        typeof weights.schema.type === 'undefined' ||
          weights.schema.type === 'string' ||
          weights.schema.type === 'integer' ||
          weights.schema.type === 'number',
        typeof weights.schema.enum !== 'undefined',
        typeof weights.options !== 'undefined' && weights.options.format === 'radio'
      ])
  },
  {
    alternatives: ['Autocomplete', 'Radio'],
    code: 'Select',
    description: SELECT_CONTROL_DEFINITION.description,
    name: SELECT_CONTROL_DEFINITION.name,
    type: ['undefined', 'enum', 'array'],
    weight: (weights) =>
      calculateConditionsScore([
        typeof weights.schema.type === 'undefined' ||
          weights.schema.type === 'string' ||
          weights.schema.type === 'array' ||
          weights.schema.type === 'integer' ||
          weights.schema.type === 'number',
        typeof weights.schema.enum !== 'undefined' ||
          (weights.schema.items instanceof Object &&
            !Array.isArray(weights.schema.items) &&
            typeof weights.schema.items.enum !== 'undefined')
      ])
  }
] as IControlElement[];

/**
 * Calculates the score a specific control type reaches against certain conditions.
 * @param conditions The conditions to check against.
 * @param additionalCustomAdvantage Increases the score by x.
 */
function calculateConditionsScore(conditions: boolean[], additionalCustomAdvantage = 0): number {
  // If every condition is satisfied, then calculate number of conditions
  // else not every condition is satisfied and therefore return 0
  return (isEveryConditionTrue(conditions) ? conditions.length : 0) + additionalCustomAdvantage;
}

function isEveryConditionTrue(conditions: boolean[]): boolean {
  return conditions.every((condition) => condition === true);
}

/**
 * Returns an array containing all control types with the one fitting best at the front and the one fitting worst at the end of the array.
 */
export function eligibleInputElements(type: string, elementContext: IControlElementContext) {
  return INPUT_ELEMENTS.filter((element) => element.type.includes(type))
    .sort((a: IControlElement, b: IControlElement) => b.weight(elementContext) - a.weight(elementContext))
    .filter((element) => element.weight(elementContext) > 0);
}

/**
 * Returns an arary containing all alternative options for a specific input and how they should be saved to the form schema.
 *
 * @param control The control to search the alternatives to.
 */
export function controlTypeAlternatives(
  controlType: string,
  controlDetails: IControlElementContext
): IControlElementType[] {
  const currentElement = INPUT_ELEMENTS.find((element) => element.code === controlType);
  const parentElement = INPUT_ELEMENTS.find((element) =>
    element.alternatives?.find((alternative) => alternative === controlType)
  );

  const availableElements = INPUT_ELEMENTS.filter(
    (element) =>
      element.code === controlType ||
      currentElement?.alternatives?.includes(element.code) ||
      parentElement?.alternatives?.includes(element.code)
  )
    .filter((element) => element.applicableAlternative === undefined || element.applicableAlternative(controlDetails))
    .map((element) => ({
      code: element.code,
      description: element.description,
      name: element.name
    }));
  availableElements.unshift(
    ...(parentElement ?
      [
        {
          code: parentElement.code,
          description: parentElement.description,
          name: parentElement.name
        }
      ]
    : [])
  );
  return availableElements;
}

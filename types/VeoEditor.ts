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
import { mdiAlphabeticalVariant, mdiCancel, mdiCheckboxOutline, mdiDecimal, mdiFileTree, mdiHelpBox, mdiLabelOutline, mdiNumeric, mdiViewList } from '@mdi/js';
import { IVeoFormSchemaItem, IVeoFormSchemaItemOptions, IVeoFormSchemaItemRule } from './VeoTypes';

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
  number: { icon: mdiDecimal, name: 'number', color: 'light-blue' },
  integer: { icon: mdiNumeric, name: 'integer', color: 'green' },
  array: { icon: mdiViewList, name: 'array', color: 'amber' },
  enum: { icon: mdiLabelOutline, name: 'enum', color: 'light-green' },
  null: { icon: mdiCancel, name: 'null', color: 'blue-grey' },
  default: { icon: mdiHelpBox, name: 'unknown', color: 'grey' }
} as IInputTypes;

/**
 * All information a form element carries in the form schema editor
 */
export interface IInputElementInfo {
  schema: any;
  options: IVeoFormSchemaItemOptions;
  elements?: IVeoFormSchemaItem[];
}

/**
 * Object containing information for all veo forms control elements
 */
export interface IInputElement {
  name: string;
  type: string[];
  options?: {
    direction?: string;
    format?: string;
  };
  weight: (weights: IInputElementInfo) => number;
}

/**
 * Const array defining all possible control types and when which input type shall be used
 */
const INPUT_ELEMENTS = [
  {
    name: 'ArrayField',
    type: ['array'],
    options: { direction: 'vertical' },
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'array', typeof weights.schema.elements !== 'undefined'])
  },
  {
    name: 'Autocomplete',
    type: ['undefined', 'enum', 'array'],
    options: { format: 'autocomplete' },
    weight: (weights) =>
      calculateConditionsScore([
        typeof weights.schema.type === 'undefined' ||
          weights.schema.type === 'string' ||
          weights.schema.type === 'integer' ||
          weights.schema.type === 'number' ||
          weights.schema.type === 'array',
        typeof weights.schema.enum !== 'undefined' ||
          (weights.schema.items instanceof Object && !Array.isArray(weights.schema.items) && typeof weights.schema.items.enum !== 'undefined'),
        typeof weights.options !== 'undefined' && weights.options.format === 'autocomplete'
      ])
  },
  {
    name: 'Checkbox',
    type: ['boolean'],
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'boolean'])
  },
  {
    name: 'InputDate',
    type: ['string'],
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'string', weights.schema.format === 'date'])
  },
  {
    name: 'InputDateTime',
    type: ['string'],
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'string', weights.schema.format === 'date-time'])
  },
  {
    name: 'InputNumber',
    type: ['number', 'integer'],
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'number' || weights.schema.type === 'integer'])
  },
  {
    name: 'InputText',
    type: ['string'],
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'string'], Number.EPSILON)
  },
  {
    name: 'InputTextMultiline',
    type: ['string'],
    options: { format: 'multiline' },
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'string', typeof weights.options !== 'undefined' && weights.options.format === 'multiline'])
  },
  {
    name: 'InputUri',
    type: ['string'],
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'string', weights.schema.format === 'uri'])
  },
  {
    name: 'LinksField',
    type: ['array'],
    options: { format: 'group', direction: 'vertical' },
    weight: (weights) => {
      const schemaItemsProperties =
        weights.schema &&
        weights.schema.items &&
        typeof weights.schema.items === 'object' &&
        !Array.isArray(weights.schema.items) &&
        weights.schema.items.properties &&
        weights.schema.items.properties;
      const isTarget = !!(schemaItemsProperties && schemaItemsProperties.target);
      return calculateConditionsScore([weights.schema.type === 'array', typeof weights.elements !== 'undefined', isTarget]);
    }
  },
  {
    name: 'MarkdownEditor',
    type: ['string'],
    options: { format: 'markdown' },
    weight: (weights) => calculateConditionsScore([weights.schema.type === 'string', typeof weights.options !== 'undefined' && weights.options.format === 'markdown'])
  },
  {
    name: 'Radio',
    type: ['undefined', 'enum', 'array'],
    options: {
      format: 'radio',
      direction: 'vertical'
    },
    weight: (weights) =>
      calculateConditionsScore([
        typeof weights.schema.type === 'undefined' || weights.schema.type === 'string' || weights.schema.type === 'integer' || weights.schema.type === 'number',
        typeof weights.schema.enum !== 'undefined',
        typeof weights.options !== 'undefined' && weights.options.format === 'radio'
      ])
  },
  {
    name: 'Select',
    type: ['undefined', 'enum', 'array'],
    weight: (weights) =>
      calculateConditionsScore([
        typeof weights.schema.type === 'undefined' ||
          weights.schema.type === 'string' ||
          weights.schema.type === 'array' ||
          weights.schema.type === 'integer' ||
          weights.schema.type === 'number',
        typeof weights.schema.enum !== 'undefined' ||
          (weights.schema.items instanceof Object && !Array.isArray(weights.schema.items) && typeof weights.schema.items.enum !== 'undefined')
      ])
  },
  {
    name: 'Tags',
    type: ['array'],
    options: { format: 'tags' },
    weight: (weights) =>
      calculateConditionsScore([
        weights.schema.type === 'array',
        !!weights.schema.items,
        weights.schema.items instanceof Object && !Array.isArray(weights.schema.items) && typeof weights.schema.items.anyOf !== 'undefined'
      ])
  }
] as IInputElement[];

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
export function eligibleInputElements(type: string, weights: any) {
  return INPUT_ELEMENTS.filter((element) => element.type.includes(type))
    .sort((a: IInputElement, b: IInputElement) => b.weight(weights) - a.weight(weights))
    .filter((element) => element.weight(weights) > 0);
}

interface IControlTypeAlternative {
  format: string;
  applicable?: (conditions: any) => boolean;
  direction?: string;
}

export interface IControlType {
  name: string;
  format?: string;
  direction?: string;
  rule?: IVeoFormSchemaItemRule;
}

/**
 * Returns an arary containing all alternative options for a specific input and how they should be saved to the form schema.
 *
 * @param control The control to search the alternatives to.
 */
export function controlTypeAlternatives(control: string, controlDetails: any): IControlType[] {
  const alternatives: Record<string, { format?: string; alternatives: Record<string, IControlTypeAlternative> }> = {
    InputText: {
      alternatives: {
        InputTextMultiline: { format: 'multiline' },
        MarkdownEditor: { format: 'markdown' }
      }
    },
    Select: {
      alternatives: {
        Radio: {
          format: 'radio',
          direction: 'horizontal',
          applicable: (currentType) => {
            return !currentType.schema.type || currentType.schema.type !== 'array';
          }
        },
        Autocomplete: { format: 'autocomplete' }
      }
    },
    InputNumber: {
      alternatives: {}
    },
    InputUri: {
      alternatives: {}
    },
    InputDate: {
      alternatives: {}
    },
    InputDateTime: {
      alternatives: {}
    },
    Checkbox: {
      alternatives: {}
    },
    Tags: {
      alternatives: {}
    },
    ArrayField: {
      alternatives: {}
    },
    LinksField: {
      alternatives: {}
    }
  };

  const items: IControlType[] = [];
  // TODO: check if there is another solution than to loop over all keys
  for (const parent of Object.keys(alternatives)) {
    if (parent === control || Object.keys(alternatives[parent].alternatives).includes(control)) {
      items.push(
        ...Object.keys(alternatives[parent].alternatives)
          .filter((child) => {
            const filterFunction = alternatives[parent].alternatives[child].applicable;
            return filterFunction === undefined || filterFunction(controlDetails);
          })
          .map((child) => {
            const item = { name: child, ...alternatives[parent].alternatives[child] };
            delete item.applicable;
            return item;
          })
      );
      items.unshift({ name: parent, format: undefined });
    }
  }

  return items;
}

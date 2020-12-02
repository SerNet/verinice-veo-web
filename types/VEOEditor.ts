import { IVEOFormSchemaItem, IVEOFormSchemaItemOptions, VEOTypeNameRAW } from 'veo-objectschema-7'

export interface IInputType {
  name: string,
  color: string
  icon: string
}

/**
 * Dictionary containing all type name for the object schema with additional styling information
 */
export type IInputTypes = Record<VEOTypeNameRAW, IInputType>

export const INPUT_TYPES = {
  string: { icon: 'mdi-alphabetical-variant', name: 'string', color: 'red' },
  boolean: { icon: 'mdi-check-box-outline', name: 'boolean', color: 'teal' },
  object: { icon: 'mdi-file-tree', name: 'object', color: 'indigo' },
  number: { icon: 'mdi-decimal', name: 'number', color: 'light-blue' },
  integer: { icon: 'mdi-numeric', name: 'integer', color: 'green' },
  array: { icon: 'mdi-view-list', name: 'array', color: 'amber' },
  enum: { icon: 'mdi-label-multiple', name: 'enum', color: 'light-green' },
  null: { icon: 'mdi-cancel', name: 'null', color: 'blue-grey' },
  default: { icon: 'mdi-help-box', name: 'unknown', color: 'grey' }
} as IInputTypes

export interface IInputElementInfo {
  schema: any,
  options: IVEOFormSchemaItemOptions,
  elements?: IVEOFormSchemaItem[]
}

/**
 * Object containing information for all veo forms control elements
 */
export interface IInputElement {
  name: string,
  type: string[],
  options?: {
    direction?: string
    format?: string
    highlight?: boolean
  }
  weight: (weights: IInputElementInfo) => number
}

const INPUT_ELEMENTS = [
  {
    name: 'ArrayField',
    type: ['array'],
    options: { direction: 'vertical' },
    weight: weights => calculateConditionsScore([
      weights.schema.type === 'array',
      typeof weights.schema.elements !== 'undefined'
    ])
  },
  {
    name: 'Autocomplete',
    type: ['array', 'undefined', 'string'],
    options: { format: 'autocomplete' },
    weight: weights => calculateConditionsScore([
      typeof weights.schema.type === 'undefined' || weights.schema.type === 'string' || weights.schema.type === 'array',
      typeof weights.schema.enum !== 'undefined' || (weights.schema.items instanceof Object && !Array.isArray(weights.schema.items) && typeof weights.schema.items.enum !== 'undefined'),
      typeof weights.options !== 'undefined' && weights.options.format === 'autocomplete'
    ])
  },
  {
    name: 'Checkbox',
    type: ['boolean'],
    weight: weights => calculateConditionsScore([
      weights.schema.type === 'boolean'
    ])
  },
  {
    name: 'InputDate',
    type: ['string'],
    weight: weights => calculateConditionsScore([
      weights.schema.type === 'string',
      weights.schema.format === 'date'
    ])
  },
  {
    name: 'InputDateTime',
    type: ['string'],
    weight: weights => calculateConditionsScore([
      weights.schema.type === 'string',
      weights.schema.format === 'date-time'
    ])
  },
  {
    name: 'InputNumber',
    type: ['number', 'integer'],
    weight: weights => calculateConditionsScore([
      weights.schema.type === 'number' || weights.schema.type === 'integer'
    ])
  },
  {
    name: 'InputText',
    type: ['string'],
    weight: weights => calculateConditionsScore([
      weights.schema.type === 'string'
    ], Number.EPSILON)
  },
  {
    name: 'InputTextMultiline',
    type: ['string'],
    options: { format: 'multiline' },
    weight: weights => calculateConditionsScore([
      weights.schema.type === 'string',
      typeof weights.options !== 'undefined' && weights.options.format === 'multiline'
    ])
  },
  {
    name: 'InputUri',
    type: ['string'],
    weight: weights => calculateConditionsScore([
      weights.schema.type === 'string',
      weights.schema.format === 'uri'
    ])
  },
  {
    name: 'LinksField',
    type: ['array'],
    options: { format: 'group', direction: 'vertical', highlight: false },
    weight: (weights) => {
      const schemaItemsProperties =
      weights.schema &&
      weights.schema.items &&
      typeof weights.schema.items === 'object' &&
      !Array.isArray(weights.schema.items) &&
      weights.schema.items.properties &&
      weights.schema.items.properties
      const isTarget = !!(schemaItemsProperties && schemaItemsProperties.target)
      return calculateConditionsScore([
        weights.schema.type === 'array',
        typeof weights.elements !== 'undefined',
        isTarget
      ])
    }
  },
  {
    name: 'MarkdownEditor',
    type: ['string'],
    options: { format: 'markdown' },
    weight: weights => calculateConditionsScore([
      weights.schema.type === 'string',
      typeof weights.options !== 'undefined' && weights.options.format === 'markdown'
    ])
  },
  {
    name: 'Radio',
    type: ['undefined', 'string'],
    options: { format: 'radio' },
    weight: weights => calculateConditionsScore([
      typeof weights.schema.type === 'undefined' || weights.schema.type === 'string',
      typeof weights.schema.enum !== 'undefined',
      typeof weights.options !== 'undefined' && weights.options.format === 'radio'
    ])
  },
  {
    name: 'Select',
    type: ['undefined', 'string', 'array'],
    weight: weights => calculateConditionsScore([
      typeof weights.schema.type === 'undefined' || weights.schema.type === 'string' || weights.schema.type === 'array',
      typeof weights.schema.enum !== 'undefined' || (weights.schema.items instanceof Object && !Array.isArray(weights.schema.items) && typeof weights.schema.items.enum !== 'undefined')
    ])
  },
  {
    name: 'Tags',
    type: ['array'],
    options: { format: 'tags' },
    weight: weights => calculateConditionsScore([
      weights.schema.type === 'array',
      !!weights.schema.items,
      weights.schema.items instanceof Object && !Array.isArray(weights.schema.items) && typeof weights.schema.items.anyOf !== 'undefined'
    ])
  }
] as IInputElement[]

export function eligibleInputElements(weights: any) {
  return INPUT_ELEMENTS.filter(element => element.type.includes(weights.schema.type)).sort(
    (a: IInputElement, b: IInputElement) => b.weight(weights) - a.weight(weights)
  ).filter(element => element.weight(weights) > 0)
}

function calculateConditionsScore(conditions: boolean[], additionalCustomAdvantage: number = 0): number {
  // @param: additionalCustomAdvantage (Optional)
  // if current conditions must have some custom advantage in comparison.

  // If every condition is satisfied, than calculate number of conditions
  // else not every condition is satisfied and therefore return 0
  return (
    (isEveryConditionTrue(conditions) ? conditions.length : 0) +
    additionalCustomAdvantage
  )
}

function isEveryConditionTrue(conditions: boolean[]): boolean {
  return conditions.every(condition => condition === true)
}

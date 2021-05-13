/**
 * Table of contents
 * 
 * 1. Basic / global types
 * 2. Types of user generated data (custom aspects/custom links)
 * 3. Objectschema / formschema types
 */

import { JSONSchema7TypeName } from "json-schema";

export type IVeoFormSchemaContentType = 'Layout' | 'Control' | 'Label' | string

/**
 * 1. Basic / global types
 */
export interface IVeoAPIMessage {
  success: boolean
  resourceId: string
  message: string
}

export interface IVeoDomain {
  displayName: string
  searchesUri: string
  targetUri: string
}

export interface IVeoUnit {
  id: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  name: string
  description: string
  domains: IVeoDomain[]
  units: IVeoUnit[]
}

export interface IVeoEntity {
  id: string
  name: string
  abbreviation: string
  displayName: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  domains: IVeoDomain[]
  owner: IVeoLink
  links: IVeoCustomLinks
  customAspects: IVeoCustomAspects
  subType: IVeoEntitySubtypes
  members: IVeoLink[] // Only contains items if entity is of type scope
  parts: IVeoLink[] // Only contains items if entity is NOT of type scope
  description: string
  descriptionShort?: string // Frontend only attribute used in VeoObjectList.vue
  type: string
}

export interface IVeoEntitySubtypes {
  [key: string]: string
}

export interface IVeoLink {
  displayName: string
  resourcesUri: string
  targetUri: string
  searchesUri: string
}

export interface IVeoTranslations {
  lang: {
    [key: string]: IVeoTranslationCollection
  }
}

export interface IVeoFormSchemaMeta {
  id?: string
  modelType: string
  name: string
  subType: string | null
}

export interface IVeoFormSchema extends IVeoFormSchemaMeta {
  content: IVeoFormSchemaItem,
  translation: IVeoFormSchemaTranslationCollection
}

export interface IVeoFormSchemaItem {
  type: IVeoFormSchemaContentType
  text?: string
  options: IVeoFormSchemaItemOptions
  elements?: IVeoFormSchemaItem[]
}

export interface IVeoFormSchemaItemOptions {
  label?: string
  format?: string
  direction?: string
}

export interface IVeoFormSchemaTranslationCollectionItem {
  [key: string]: string
}

export interface IVeoFormSchemaTranslationCollection {
  [key: string]: IVeoFormSchemaTranslationCollectionItem
}

export interface IVeoFormSchemaCustomTranslationEvent {
  [key: string]: string | undefined
}

export interface IVeoFormSchemaItemUpdateEvent {
  formSchemaPointer: string
  data: IVeoFormSchemaItem
}

export interface IVeoFormSchemaItemDeleteEvent {
  formSchemaPointer: string
}

export interface IVeoReportsMeta {
  [key: string]: IVeoReportMeta
}

export interface IVeoReportMeta {
  name: {
    [key: string]: string
  }
  description: {
    [key: string]: string
  }
  outputTypes: string[]
  multipleTargetsSupported: boolean
  targetTypes: string[]
}

export interface IVeoCreateReportData {
  outputType: string
  targets: {
    type: string
    id: string
  }[]
}

export interface IVeoObjectHistoryEntry {
  author: string
  content: IVeoEntity
  time: string
  type: string
  changeNumber: number
}

/**
 * 2. Types of user generated data
 */
interface IVeoCustomObject {
  applicableTo: IVeoLink[]
  attributes: IVeoCustomAttributes
  domains: IVeoDomain[]
}

export interface IVeoCustomLinks {
  [key: string]: IVeoCustomLink
}

export interface IVeoCustomLink extends IVeoCustomObject {
  name: string
  target: IVeoLink
}

export interface IVeoCustomAspects {
  [key: string]: IVeoCustomAspect
}

export interface IVeoCustomAspect extends IVeoCustomObject {

}

// At the moment, we only use strings in the frontend for custom attributes.
// Later on, there are plans to use numbers and booleans as well.
export interface IVeoCustomAttributes {
  [key: string]: string
}

/**
 * 3. Objectschema and formschema types
 * 
 * NOTE: THESE TYPES ONLY GET USED FOR SCHEMAS, ALL USER DATA WILL USE THE ABOVE types.
 */

/**
 * 
 */
export interface IVeoObjectSchema {
  $schema: string
  type: JSONSchema7TypeName
  properties: {
    abbreviation: IVeoObjectSchemaProperty
    createdAt: IVeoObjectSchemaProperty
    createdBy: IVeoObjectSchemaProperty
    customAspects: IVeoObjectSchemaCustomObjects
    description: IVeoObjectSchemaProperty
    domains: IVeoObjectSchemaArray
    id: IVeoObjectSchemaProperty
    links: IVeoObjectSchemaCustomObjects
    name: IVeoObjectSchemaProperty
    owner: IVeoObjectSchemaObject
    parts: IVeoObjectSchemaArray
    subType: IVeoObjectSchemaProperty
    updatedAt: IVeoObjectSchemaProperty
    updatedBy: IVeoObjectSchemaProperty
    translations?: IVeoObjectSchemaTranslations
  }
  required: string[]
  title: string
  description: string
}

export interface IVeoObjectSchemaProperty {
  type?: JSONSchema7TypeName
  title?: string
  description?: string
  pattern?: string
  [key: string]: any
}

export interface IVeoObjectSchemaCustomObjects {
  type: JSONSchema7TypeName
  title: string
  description: string
  properties: {
    [key: string]: IVeoObjectSchemaCustomAspect | IVeoObjectSchemaCustomLink
  }
}

export interface IVeoObjectSchemaCustomAspect {
  type: 'object'
  properties: {
    id: IVeoObjectSchemaProperty
    applicableTo: IVeoObjectSchemaArray
    domains: IVeoObjectSchemaArray
    references: IVeoObjectSchemaArray
    attributes: IVeoObjectSchemaObject
  }
  additionalProperties: boolean
  required: string[]
}

export interface IVeoObjectSchemaCustomLink {
  type: 'array',
  items: {
    type: 'object'
    properties: {
      id: IVeoObjectSchemaProperty
      applicableTo: IVeoObjectSchemaArray
      domains: IVeoObjectSchemaArray
      references: IVeoObjectSchemaArray
      abbreviation: IVeoObjectSchemaProperty
      description: IVeoObjectSchemaProperty
      name: IVeoObjectSchemaProperty
      target: IVeoObjectSchemaObject
      attributes: IVeoObjectSchemaObject
    }
    additionalProperties: boolean
    required: string[]
  }
}

export interface IVeoObjectSchemaObject extends IVeoObjectSchemaProperty {
  type: 'object'
  properties: {
    [key: string]: IVeoObjectSchemaProperty
  }
}

export interface IVeoObjectSchemaArray extends IVeoObjectSchemaProperty {
  type: 'array'
  items: any
}

export interface IVeoObjectSchemaTranslations {
  [key: string]: IVeoTranslationCollection
}

export interface IVeoTranslationCollection {
  [key: string]: string
}

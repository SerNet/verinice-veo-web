/**
 * Table of contents
 * 
 * 1. Basic / global types
 * 2. Types of user generated data (custom aspects/custom links)
 * 3. Objectschema / formschema types
 */

import { VEOObjectSchemaRAW } from "veo-objectschema-7";

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

export interface IVeoScope extends IVeoEntity {
  members: IVeoLink[]
}

export interface IVeoEntity {
  id: string
  name: string
  abbreviation: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  domains: IVeoDomain[]
  owner: IVeoLink
  links: IVeoCustomLinks
  customAspects: IVeoCustomAspects
  subType: IVeoEntitySubtypes
  parts: any[]
  description: string
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
    [key: string]: IVeoTranslation
  }
}

export interface IVeoTranslation {
  [key: string]: string
}

export interface IVeoFormSchemaMeta {
  id: string
  modelType: string
  name: string
  subType: string | null
}

export interface IVeoFormSchema extends IVeoFormSchemaMeta {
  content: IVeoFormSchemaEntry
}

export interface IVeoFormSchemaEntry {
  type?: string
  options: {
    [key: string]: string
  }
  elements: IVeoFormSchemaEntry[]
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
// TODO: Implement in #116
export interface IVeoObjectSchema extends VEOObjectSchemaRAW {
}

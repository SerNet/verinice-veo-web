/**
 * Interface defining the form schema used for typing.
 */
declare module 'veo-formschema' {
  export type IVEOFormSchemaContentType = 'Layout' | 'Control' | string

  export interface IVEOFormSchemaItemOptions {
    label?: string
    format?: string
    direction?: string
    highlight?: boolean
  }

  export interface IVEOFormSchemaItem {
    type: IVEOFormSchemaContentType
    scope?: string
    options?: IVEOFormSchemaItemOptions
    elements?: IVEOFormSchemaItem[]
  }

  export interface IVEOFormSchemaTranslationCollectionItem {
    [key: string]: string
  }

  export interface IVEOFormSchemaTranslationCollection {
    [key: string]: IVEOFormSchemaTranslationCollectionItem
  }

  export interface IVEOFormSchema {
    name: string
    modelType: string
    subType: string | null
    translation: IVEOFormSchemaTranslationCollection
    content: IVEOFormSchemaItem
  }
}

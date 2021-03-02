/**
 * Interface defining the form schema used for typing.
 */
declare module 'veo-formschema' {
  export type IVEOFormSchemaContentType = 'Layout' | 'Control' | 'Label' | string

  export interface IVEOFormSchemaItemOptions {
    label?: string
    format?: string
    direction?: string
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

  /**
   * FormSchemaEditor Types
   */
  export interface IVEOFormSchemaCustomTranslationEvent {
    [key: string]: string | undefined
  }

  export interface IVEOFormSchemaItemUpdateEvent {
    formSchemaPointer: string
    data: IVEOFormSchemaItem
  }

  export interface IVEOFormSchemaItemDeleteEvent {
    formSchemaPointer: string
  }
}

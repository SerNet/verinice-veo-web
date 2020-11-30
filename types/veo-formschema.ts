/**
 * Interface defining the form schema used for typing.
 */
declare module 'veo-objectschema-7' {

    export type IVEOFormSchemaContentType = 'Layout' | 'Control' | string

    export interface IVEOFormSchemaContentOptions {
        format?: string,
        direction?: string,
        label?: string
    }

    export interface IVEOFormSchemaContent {
        type: IVEOFormSchemaContentType,
        scope?: string,
        options?: IVEOFormSchemaContentOptions,
        elements?: IVEOFormSchemaContent[]
    }

    export interface IVEOFormSchema {
        name: string,
        modelType: string,
        content: IVEOFormSchemaContent
    }
}

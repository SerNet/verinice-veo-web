/**
 * Interface defining the form schema used for typing.
 */
declare module 'veo-objectschema-7' {

    export type IVEOFormSchemaContentType = 'Layout' | 'Control' | string

    export interface IVEOFormSchemaItemOptions {
        label?: string
        format?: string,
        direction?: string,
        highlight?: boolean
    }

    export interface IVEOFormSchemaItem {
        type: IVEOFormSchemaContentType,
        scope?: string,
        options?: IVEOFormSchemaItemOptions,
        elements?: IVEOFormSchemaItem[]
    }

    export interface IVEOFormSchema {
        name: string,
        modelType: string,
        content: IVEOFormSchemaItem
    }
}

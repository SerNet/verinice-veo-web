import { IVEOFormSchema } from 'veo-objectschema-7'

export function generateSchema(name: string, modelType: string): IVEOFormSchema {
  return {
    name,
    modelType,
    content: {
      type: 'Layout',
      options: {
        format: 'group',
        direction: 'vertical'
      },
      elements: []
    }
  }
}

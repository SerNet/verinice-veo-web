import { IVEOFormSchema } from 'veo-formschema'

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

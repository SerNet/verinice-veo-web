import { UISchema } from '@cpmsys/veo-forms/lib/types/UISchema'

enum ObjectSchemaNames {
  asset = 'asset',
  control = 'control',
  person = 'person',
  process = 'process'
}

export interface BaseFormSchema {
  name: string
  modelType: ObjectSchemaNames
}

export interface FormSchema extends BaseFormSchema {
  content: UISchema
}

export interface FormSchemaMeta extends BaseFormSchema {
  id: string
}

export type FormSchemaMetas = FormSchemaMeta[]

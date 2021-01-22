import { UISchema } from '~/types/UISchema'

export interface BaseFormSchema {
  name: string
  modelType: string
  subType: string
}

export interface FormSchema extends BaseFormSchema {
  content: UISchema
}

export interface FormSchemaMeta extends BaseFormSchema {
  id: string
}

export type FormSchemaMetas = FormSchemaMeta[]

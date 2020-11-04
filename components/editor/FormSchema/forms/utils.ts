import { JSONSchema7 } from 'json-schema'
import { UISchema } from '~/types/UISchema'

type defaultType = string | boolean | number | undefined | null

export interface BaseObject {
  [key: string]: any
}

export interface ILinksFieldDialogNewObject {
  name?: string
  abbreviation?: string
  description?: string
}

export interface ILinksFieldDialogUpdatedObject
  extends ILinksFieldDialogNewObject,
    BaseObject {
  name?: string
  abbreviation?: string
  description?: string
  // TODO: activate after displayName is implemented
  // displayName: string
  id: string
}

export interface ISearchParams {
  displayName: string
}

export interface IApi {
  fetchAll(
    objectType: string,
    searchParams?: ISearchParams,
  ): Promise<BaseObject[]>
  create(
    objectType: string,
    createdObjectData: ILinksFieldDialogNewObject,
  ): Promise<BaseObject>
  update(
    objectType: string,
    updatedObjectData: ILinksFieldDialogUpdatedObject,
  ): Promise<void>
  delete(objectType: string, id: string): Promise<void>
}

export function isContain(
  array: defaultType[],
  elementToContain: defaultType[] | defaultType
) {
  if (Array.isArray(elementToContain)) {
    // Check if every element of elementToContain is in array included
    return elementToContain.every(el => array.includes(el))
  } else {
    return array.includes(elementToContain)
  }
}

export const linksFieldDialogObjectSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    abbreviation: {
      type: 'string'
    },
    description: {
      type: 'string'
    }
  }
}

export const linksFieldDialogFormSchema: UISchema = {
  type: 'Layout',
  options: {
    format: 'group',
    direction: 'vertical'
  },
  elements: [
    {
      type: 'Control',
      scope: '#/properties/name',
      options: {
        label: '#lang/name'
      }
    },
    {
      type: 'Control',
      scope: '#/properties/abbreviation',
      options: {
        label: '#lang/abbreviation'
      }
    },
    {
      type: 'Control',
      scope: '#/properties/description',
      options: {
        label: '#lang/description'
      }
    }
  ]
}

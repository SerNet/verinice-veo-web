/**
 * Originally, most interfaces extended a json-schema interface or type. However as overwriting
 * properties isn't really possible, the decision was made to create complete custom interfaces
 * based on the json-schema interfaces in order to narrow done the amount of options the developer
 * can choose from to avoid bugs in the schema generation. If the schema gets extended, this file
 * has to be modified.
 */
declare module 'veo-objectschema-7' {
  import { JSONSchema7Object, JSONSchema7Type, JSONSchema7TypeName } from 'json-schema'

  export type VEOTypeRAW = JSONSchema7Type | 'enum' | 'default'
  export type VEOTypeNameRAW = JSONSchema7TypeName | 'enum' | 'default'

  export interface VEOStringRAW {
    type: 'string'
    description?: string
    title?: string
    format?: string
    pattern?: string

  }

  export interface VEOEnumRAW {
    description?: string
    enum: string[]
  }

  export interface VEOAttributeRAW {
    title: string
    type: VEOTypeRAW
    format?: string
    pattern?: string
  }

  export interface VEOAttributesRAW {
    type: 'object'
    properties: {
      [key: string]: VEOAttributeRAW
    }
  }

  export interface VEODomainLinkRAW {
    type: 'object'
    properties: {
      displayName: VEOStringRAW
      resourcesUri?: VEOStringRAW
      searchesUri?: VEOStringRAW
      targetUri: VEOStringRAW
    }
    required: ['targetUri']
    description?: string
  }

  export interface VEODomainsRAW {
    type: 'array'
    items: VEODomainLinkRAW
    title?: string
    description?: string
    uniqueItems?: boolean
  }

  export interface VEOLinkDomainsLinkRAW {
    type: 'object'
    properties: {
      displayName: VEOStringRAW
      resourcesUri?: VEOStringRAW
      searchesUri?: VEOStringRAW
      targetUri: VEOStringRAW
    }
    required: ['targetUri']
  }

  export interface VEOLinkDomainsRAW {
    type: 'array'
    title: string
    description: string
    items: VEOLinkDomainsLinkRAW
    uniqueItems: boolean
  }

  export interface VEOReferencesRAW {
    type: 'array'
    items: {
      properties: {
        displayName: VEOStringRAW
        targetUri: VEOStringRAW
      },
      required: ['targetUri']
    }
  }

  export interface VEOCustomAspectRAW {
    type: 'object'
    properties: {
      id: JSONSchema7Object
      applicableTo: JSONSchema7Object
      domains: VEODomainsRAW
      references: VEOReferencesRAW
      attributes: VEOAttributesRAW
    },
    additionalAttributes: false
    required: ['type']
  }

  export interface VEOCustomAspectsRAW {
    type: 'object'
    title: string,
    description: string
    properties: {
      [key: string]: VEOCustomAspectRAW
    }
  }

  export interface VEOCustomLinkRAW {
    type: 'array',
    items: {
      type: 'object'
      properties: {
        id: JSONSchema7Object
        applicableTo: JSONSchema7Object
        domains: VEOLinkDomainsRAW
        references: VEOReferencesRAW
        abbreviation: VEOStringRAW
        description: VEOStringRAW
        name: VEOStringRAW
        target: {
          type: 'object'
          title: string
          properties: {
            targetUri: VEOStringRAW
            type: VEOEnumRAW
          }
        }
        attributes: VEOAttributesRAW
      }
      additionalProperties: false
      required: ['type', 'target']
    }
  }

  export interface VEOCustomLinksRAW {
    type: 'object'
    title: string
    description: string
    properties: {
      [key: string]: VEOCustomLinkRAW
    }
  }

  export interface VEOObjectSchemaRAW {
    $schema: string
    type: 'object'
    properties: {
      [key: string]: any
      abbreviation: VEOStringRAW
      customAspects: VEOCustomAspectsRAW
      description: VEOStringRAW
      domains: VEODomainsRAW
      id: VEOStringRAW
      links: VEOCustomLinksRAW
      name: VEOStringRAW
      owner: VEODomainLinkRAW
      validFrom: VEOStringRAW
    }
    required: string[]
    title: string
    description: string
  }
}

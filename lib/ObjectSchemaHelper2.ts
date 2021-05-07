import { merge } from "lodash";

import {
  IVeoObjectSchema,
  IVeoObjectSchemaCustomAspect,
  IVeoObjectSchemaCustomLink,
  IVeoObjectSchemaProperty
} from "~/types/VeoTypes";
import ObjectSchemaValidator, {
  VeoSchemaValidatorValidationResult
} from "./ObjectSchemaValidator";

export interface IVeoOSHCustomAspect {
  title: string
  attributes: IVeoOSHCustomProperty[]
  prefix?: string
}

export interface IVeoOSHCustomLink extends IVeoOSHCustomAspect {
  description: string
  targetType: string
}
export interface IVeoOSHCustomProperty {
  title: string
  type: string
  description: string
  prefix?: string
  multiple?: boolean
  format?: string
  pattern?: string
}

export interface IVeoOSHOptions {
  customAspectsKey?: string
  customLinksKey?: string
}

const DEFAULT_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    abbreviation: {
      type: 'string',
      description: 'The abbreviation for the EntityLayerSupertype.'
    },
    createdAt: {
      type: 'string',
      description: 'A timestamp acc. to RFC 3339 specifying when this entity was created.'
    },
    createdBy: {
      type: 'string',
      description: 'The username of the user who created this object.'
    },
    customAspects: {
      type: 'object',
      title: 'CustomAspect',
      description: 'A custom property which is determined by the requested entity schema - see \'/schemas\'',
      properties: {}
    },
    description: {
      type: 'string',
      description: 'The description for the EntityLayerSupertype.'
    },
    domains: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            description: 'A friendly human readable title of the referenced domain.'
          },
          resourcesUri: {
            type: 'string'
          },
          searchesUri: {
            type: 'string'
          },
          targetUri: {
            type: 'string',
            description: 'The resource URL of the referenced domain.'
          }
        },
        required: ['targetUri'],
        description: 'The domains this entity is being used in.'
      }
    },
    id: {
      type: 'string',
      description: 'ID must be a valid UUID string following RFC 4122.'
    },
    links: {
      type: 'object',
      title: 'CustomLink',
      description: 'Custom relations which do not affect the behavior.',
      properties: {
      }
    },
    name: {
      type: 'string',
      description: 'The name for the EntityLayerSupertype.'
    },
    owner: {
      type: 'object',
      properties: {
        displayName: {
          type: 'string',
          description: 'A friendly human readable title of the referenced unit.'
        },
        resourcesUri: {
          type: 'string',
          description: 'URI the owner can get accessed by.'
        },
        searchesUri: {
          type: 'string',
          description: 'URI the owner can get searched by'
        },
        targetUri: {
          type: 'string',
          description: 'The resource URL of the referenced unit.'
        }
      },
      required: ['targetUri'],
      description: 'A reference to the unit containing this entity.'
    },
    parts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            description: 'A friendly human readable title of the referenced entity.'
          },
          resourcesUri: {
            type: 'string'
          },
          searchesUri: {
            type: 'string'
          },
          targetUri: {
            type: 'string',
            description: 'The resource URL of the referenced entity.'
          }
        },
        required: [
          'targetUri'
        ],
        description: 'A reference to an entity\'s part'
      }
    },
    subType: {
      type: 'object',
      title: 'SubType',
      description: 'The sub type this entity has in each domain. Domain ID is key, sub type is value.'
    },
    updatedAt: {
      type: 'string',
      description: 'A timestamp acc. to RFC 3339 specifying when this version of the entity was saved.'
    },
    updatedBy: {
      type: 'string',
      description: 'The username of the user who last updated this object.'
    }
  },
  required: ['name', 'owner'],
  title: '',
  description: ''
}

/**
 * This class handles creating the schema for object schemas and editing them.
 * Internally, a more developer friendly data structure gets used than the schema itself,
 * which only gets generated by toSchema().
 */
export default class ObjectSchemaHelper {
  private _schema: IVeoObjectSchema

  private _title: string

  private _description: string

  private _customAspects: IVeoOSHCustomAspect[]

  private _customLinks: IVeoOSHCustomLink[]

  private _basicProperties: IVeoOSHCustomProperty[]

  private _options: IVeoOSHOptions

  constructor(objectSchema?: IVeoObjectSchema, options?: IVeoOSHOptions) {
    this._title = ''
    this._description = ''
    this._customAspects = []
    this._customLinks = []
    this._basicProperties = []

    this._options = { customAspectsKey: 'customAspects', customLinksKey: 'links' }
    merge(this._options, options)

    if (!objectSchema) {
      // @ts-ignore
      this._schema = DEFAULT_SCHEMA
      this.loadObjectSchema(DEFAULT_SCHEMA as IVeoObjectSchema)
    } else {
      this._schema = JSON.parse(JSON.stringify(objectSchema))
      this._schema.properties.customAspects.properties = {}
      this._schema.properties.links.properties = {}
      this.loadObjectSchema(objectSchema as IVeoObjectSchema)
    }
  }

  public setTitle(value: string) {
    this._title = value
    this.updateSchemaPrefixes()
  }

  public getTitle(): string {
    return this._title
  }

  public setDescription(value: string) {
    this._description = value
  }

  public getDescription(): string {
    return this._description
  }

  public addCustomAspect(name: string) {
    const aspect: IVeoOSHCustomAspect = {
      title: name,
      prefix: `${this._title}_`,
      attributes: []
    }
    this._customAspects.push(aspect)
  }

  public updateCustomAspect(aspectName: string, aspect: IVeoOSHCustomAspect) {
    const aspectIndex = this._customAspects.findIndex(aspect => aspect.title === aspectName)

    if (aspectIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::updateCustomAspect: Aspect "${aspectName}" not found!`)
    } else {
      aspect.prefix = `${this._title}_`
      this._customAspects[aspectIndex] = aspect
      this.updateAspectAttributePrefixes(aspectIndex)
    }
  }

  public updateCustomAspectAttributes(aspectName: string, attributes: IVeoOSHCustomProperty[]) {
    const aspectIndex = this._customAspects.findIndex(aspect => aspect.title === aspectName)

    if (aspectIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::updateCustomAspectAttributes: Aspect "${aspectName}" not found!`)
    } else {
      this._customAspects[aspectIndex].attributes = attributes
      this.updateAspectAttributePrefixes(aspectIndex)
    }
  }

  public renameCustomAspect(oldName: string, newName: string) {
    const aspectIndex = this._customAspects.findIndex(aspect => aspect.title === oldName)

    if (aspectIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::renameCustomAspect: Aspect "${oldName}" not found!`)
    } else {
      this._customAspects[aspectIndex].title = newName
      this.updateAspectAttributePrefixes(aspectIndex)
    }
  }

  public removeCustomAspect(aspectName: string) {
    const aspectIndex = this._customAspects.findIndex(aspect => aspect.title === aspectName)

    if (aspectIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::removeCustomAspect: Aspect "${aspectName}" not found!`)
    } else {
      this._customAspects.splice(aspectIndex, 1)
    }
  }

  public getCustomAspects(): IVeoOSHCustomAspect[] {
    return this._customAspects
  }

  public getCustomAspect(name: string): IVeoOSHCustomAspect | undefined {
    return this._customAspects.find(item => item.title === name)
  }

  public addCustomLink(name: string, type: string, description: string) {
    const link: IVeoOSHCustomLink = {
      title: name,
      prefix: `${this._title}_`,
      attributes: [],
      targetType: type,
      description
    }
    this._customLinks.push(link)
  }

  public updateCustomLink(linkName: string, link: IVeoOSHCustomLink) {
    const linkIndex = this._customLinks.findIndex(link => link.title === linkName)

    if (linkIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::updateCustomLink: Link "${linkName}" not found!`)
    } else {
      link.prefix = `${this._title}_`
      this._customLinks[linkIndex] = link
      this.updateCustomLinkAttributes(linkName, link.attributes)
    }
  }

  public updateCustomLinkAttributes(linkName: string, attributes: IVeoOSHCustomProperty[]) {
    const linkIndex = this._customLinks.findIndex(link => link.title === linkName)

    if (linkIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::updateCustomLinkAttributes: Link "${linkName}" not found!`)
    } else {
      this._customLinks[linkIndex].attributes = attributes
      this.updateLinkAttributePrefixes(linkIndex)
    }
  }

  public renameCustomLink(oldName: string, newName: string) {
    const linkIndex = this._customLinks.findIndex(link => link.title === oldName)

    if (linkIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::renameCustomLink: Link "${oldName}" not found!`)
    } else {
      this._customLinks[linkIndex].title = newName
      this.updateLinkAttributePrefixes(linkIndex)
    }
  }

  public removeCustomLink(linkName: string) {
    const linkIndex = this._customLinks.findIndex(link => link.title === linkName)

    if (linkIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::removeCustomLink: Link "${linkName}" not found!`)
    } else {
      this._customLinks.splice(linkIndex, 1)
    }
  }

  public getCustomLinks(): IVeoOSHCustomLink[] {
    return this._customLinks
  }

  public getCustomLink(name: string): IVeoOSHCustomLink | undefined {
    return this._customLinks.find(item => item.title === name)
  }

  public getBasicProperties(): IVeoOSHCustomProperty[] {
    return this._basicProperties
  }

  public toSchema(): IVeoObjectSchema {
    const dummy: IVeoObjectSchema = this.generateSchema()

    for (const aspect of this._customAspects) {
      this.addAspectToSchema(dummy, aspect)
    }

    for (const link of this._customLinks) {
      this.addLinkToSchema(dummy, link)
    }

    return dummy
  }

  public validate(): VeoSchemaValidatorValidationResult {
    const validator = new ObjectSchemaValidator()
    return validator.validate(this.toSchema())
  }

  public static generateLinkSchema(link: IVeoOSHCustomLink): IVeoObjectSchemaCustomLink {
    const schemaLink: IVeoObjectSchemaCustomLink = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            title: 'The UUID to identify the element',
            format: 'regex',
            pattern: '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}'
          },
          applicableTo: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          domains: {
            type: 'array',
            title: 'The list of domains in which this element is present.',
            description: 'The ids of elements of the type domain.',
            items: {
              type: 'object',
              properties: {
                displayName: {
                  type: 'string',
                  description: 'A friendly human readable title of the referenced domain.'
                },
                targetUri: {
                  type: 'string',
                  description: 'The resource URL of the referenced domain.'
                }
              },
              required: ['targetUri']
            },
            uniqueItems: true
          },
          references: {
            type: 'array',
            items: {
              properties: {
                displayName: {
                  type: 'string',
                  description: 'A friendly human readable title of the referenced object.'
                },
                targetUri: {
                  type: 'string',
                  description: 'The resource URL of the referenced object.'
                }
              },
              required: ['targetUri']
            }
          },
          abbreviation: {
            type: 'string',
            title: 'Abbreviation',
            description: 'The abbreviation for this custom link.'
          },
          description: {
            type: 'string',
            title: 'Description',
            description: 'The name for this custom link.'
          },
          name: {
            type: 'string',
            title: 'Name',
            description: 'The name for this custom link.'
          },
          target: {
            type: 'object',
            title: link.description,
            properties: {
              targetUri: {
                type: 'string',
                title: 'The id of the target object.'
              },
              type: {
                enum: [link.targetType]
              }
            }
          },
          attributes: {
            type: 'object',
            properties: {}
          }
        },
        additionalProperties: false,
        required: ['target']
      }
    }

    for (const attribute of link.attributes) {
      // @ts-ignore
      const dummy: IVeoObjectSchemaProperty = { ...attribute }
      dummy.title = dummy.description
      delete dummy.prefix
      delete dummy.description

      // @ts-ignore We cast attribute to IVeoObjectSchemaProperty a couple lines before,
      // however there is still some data in there which is not defined in IVeoObjectSchemaProperty
      if (dummy.type === 'enum') {
        delete dummy.type
        if (!!dummy.multiple) {
          dummy.type = 'array'
          dummy.items = { enum: dummy.enum }
          delete dummy.enum
        } else {
          delete dummy.items
        }
      } else {
        delete dummy.enum
      }

      delete dummy.multiple

      schemaLink.items.properties.attributes.properties[`${attribute.prefix}${attribute.title}`] = dummy
    }

    return schemaLink
  }

  public static generateAspectSchema(aspect: IVeoOSHCustomAspect): IVeoObjectSchemaCustomAspect {
    const schemaAspect = {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: {
          type: 'string',
          title: 'The UUID to identify the element',
          format: 'regex',
          pattern: '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}'
        },
        applicableTo: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        domains: {
          type: 'array',
          title: 'The list of domains in which this element is present.',
          description: 'The ids of elements of the type domain.',
          items: {
            type: 'object',
            properties: {
              displayName: {
                type: 'string',
                description: 'A friendly human readable title of the referenced domain.'
              },
              targetUri: {
                type: 'string',
                description: 'The resource URL of the referenced domain.'
              }
            },
            required: ['targetUri']
          },
          uniqueItems: true
        },
        references: {
          type: 'array',
          items: {
            properties: {
              displayName: {
                type: 'string',
                description: 'A friendly human readable title of the referenced object.'
              },
              targetUri: {
                type: 'string',
                description: 'The resource URL of the referenced object.'
              }
            },
            required: ['targetUri']
          }
        },
        attributes: {
          type: 'object',
          properties: {}
        }
      }
    }

    for (const attribute of aspect.attributes) {
      // @ts-ignore
      const dummy: IVeoObjectSchemaProperty = { ...attribute }
      dummy.title = dummy.description
      delete dummy.prefix
      delete dummy.description

      // @ts-ignore We cast attribute to IVeoObjectSchemaProperty a couple lines before,
      // however there is still some data in there which is not defined in IVeoObjectSchemaProperty
      if (dummy.type === 'enum') {
        delete dummy.type
        if (!!dummy.multiple) {
          dummy.type = 'array'
          dummy.items = { enum: dummy.enum }
          delete dummy.enum
        } else {
          delete dummy.items
        }
      } else {
        delete dummy.enum
      }

      delete dummy.multiple

      // @ts-ignore
      schemaAspect.properties.attributes.properties[`${attribute.prefix}${attribute.title}`] = dummy
    }

    // @ts-ignore
    return schemaAspect
  }

  private loadObjectSchema(objectSchema: IVeoObjectSchema) {
    this._title = objectSchema.title
    this._description = objectSchema.description

    for (const key in objectSchema.properties) {
      switch (key) {
        case this._options.customAspectsKey:
          // @ts-ignore
          this.loadCustomAspects(objectSchema.properties[key])
          break
        case this._options.customLinksKey:
          // @ts-ignore
          this.loadCustomLinks(objectSchema.properties[key])
          break
        default:
          this.loadBasicProperties(objectSchema.properties, key)
      }
    }
  }

  private loadCustomAspects(aspects: IVeoObjectSchema['properties']['customAspects']) {
    for (let aspectName in aspects.properties) {
      const aspect = aspects.properties[aspectName] as IVeoObjectSchemaCustomAspect
      const dummy: any = {}
      dummy.title = this.cleanCustomObjectName(aspectName)
      dummy.attributes = []
      dummy.prefix = `${this._title}_`

      for (let attributeName in aspect.properties.attributes.properties) {
        const attribute = aspect.properties.attributes.properties[attributeName]

        const toPush = {
          ...attribute,
          title: this.cleanAttributeName(attributeName, dummy.title),
          description: attribute.title,
          type: this.getAttributeType(attribute),
          prefix: `${dummy.prefix}${dummy.title}_`
        } as any

        // Multi selects are stored as arrays, so we have to manually transform them to an enum.
        if (toPush.type === 'array' && toPush.items.enum) {
          toPush.enum = toPush.items.enum
          toPush.multiple = true
          toPush.type = 'enum'
        }

        dummy.attributes.push(toPush)
      }
      this._customAspects.push(dummy)
    }
  }

  private loadCustomLinks(links: IVeoObjectSchema['properties']['links']) {
    for (let linkName in links.properties) {
      const link = links.properties[linkName] as IVeoObjectSchemaCustomLink
      const dummy: any = {}
      dummy.title = this.cleanCustomObjectName(linkName)
      dummy.attributes = []
      dummy.prefix = `${this._title}_`
      dummy.description = link.items.properties.target.title
      dummy.targetType = link.items.properties.target.properties.type.enum[0]

      for (let attributeName in link.items.properties.attributes.properties) {
        const attribute = link.items.properties.attributes.properties[attributeName]

        const toPush = {
          ...attribute,
          title: this.cleanAttributeName(attributeName, dummy.title),
          description: attribute.title,
          type: this.getAttributeType(attribute),
          prefix: `${dummy.prefix}${dummy.title}_`
        } as any

        // Multi selects are stored as arrays, os we have to manually transform them to an enum.
        if (toPush.type === 'array' && toPush.items.enum) {
          toPush.enum = toPush.items.enum
          toPush.multiple = true
          toPush.type = 'enum'
        }

        dummy.attributes.push(toPush)
      }
      this._customLinks.push(dummy)
    }
  }

  private loadBasicProperties(schema: IVeoObjectSchema['properties'], key: string) {
    // @ts-ignore
    const property = schema[key] as IVeoObjectSchemaProperty
    this._basicProperties.push({ title: key, description: property.description || '', type: this.getAttributeType(property), prefix: '' })
  }

  private getAttributeType(attribute: IVeoObjectSchemaProperty) {
    return attribute.type ? attribute.type : attribute.enum ? 'enum' : 'unknown'
  }

  private cleanCustomObjectName(customObjectName: string) {
    return customObjectName.replace(`${this._title}_`, '')
  }

  private cleanAttributeName(attributeName: string, customObjectName: string) {
    return attributeName.replace(`${this._title}_`, '').replace(`${customObjectName}_`, '')
  }

  private updateAspectAttributePrefixes(aspectIndex: number) {
    for (const attributeIndex in this._customAspects[aspectIndex].attributes) {
      this._customAspects[aspectIndex].attributes[attributeIndex].prefix = `${this._customAspects[aspectIndex].prefix}${this._customAspects[aspectIndex].title}_`
    }
  }

  private updateLinkAttributePrefixes(linkIndex: number) {
    for (const attributeIndex in this._customLinks[linkIndex].attributes) {
      this._customLinks[linkIndex].attributes[attributeIndex].prefix = `${this._customLinks[linkIndex].prefix}${this._customLinks[linkIndex].title}_`
    }
  }

  private updateSchemaPrefixes() {
    for (const aspectIndex in this._customAspects) {
      this._customAspects[aspectIndex].prefix = `${this._title}_`
      this.updateAspectAttributePrefixes(aspectIndex as unknown as number)
    }

    for (const linkIndex in this._customLinks) {
      this._customLinks[linkIndex].prefix = `${this._title}_`
      this.updateLinkAttributePrefixes(linkIndex as unknown as number)
    }
  }

  /**
   * Schema generation
   * 
   * All following functions are only used for schema generation and should only be called by the toSchema() method.
   */
  private generateSchema(): IVeoObjectSchema {
    this._schema.title = this._title
    this._schema.description = this._description
    this._schema.properties.customAspects.properties = {}
    this._schema.properties.links.properties = {}
    return this._schema
  }

  private addAspectToSchema(schema: IVeoObjectSchema, aspect: IVeoOSHCustomAspect) {
    schema.properties.customAspects.properties[`${aspect.prefix}${aspect.title}`] = ObjectSchemaHelper.generateAspectSchema(aspect)
  }

  private addLinkToSchema(schema: IVeoObjectSchema, link: IVeoOSHCustomLink) {
    schema.properties.links.properties[`${link.prefix}${link.title}`] = ObjectSchemaHelper.generateLinkSchema(link)
  }
}

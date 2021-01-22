
import { isObject, replace } from 'lodash'
import { VEOCustomAspectRAW, VEOObjectSchemaRAW, VEOAttributeRAW, VEOCustomLinkRAW, VEOTypeRAW, VEOTypeNameRAW } from 'veo-objectschema-7'
import VeoSchemaValidator, { VeoSchemaValidatorValidationResult } from './VeoSchemaValidator'

export interface IObjectSchemaHelperOptions {
  customProperties?: Record<string, string>
}

export interface IVEOAttribute {
  raw?: VEOAttributeRAW
  type: VEOTypeRAW
  title: string
  description: string
  enum?: any[]
}

export interface IVEOCustomAspect {
  raw?: VEOCustomAspectRAW,
  attributes: IVEOAttribute[]
  title: string
}

export interface IVEOCustomLink {
  raw?: VEOCustomLinkRAW
  attributes: IVEOAttribute[]
  title: string
  target: {
    type: string,
    description: string
  }
}

export interface IVEOBasicProperty {
  raw?: any
  title: string
  type: VEOTypeNameRAW
  description: string
}

interface IHelperOptions {
  customProperties: Record<string, string>
}

/**
 * Object containing a list of all
 */
const CUSTOM_PROPERTIES: Record<string, string> = {
  links: 'links',
  customAspects: 'customAspects'
}

/**
 * Removes spaces and other unwanted characters from a string in order to use it as an object key.
 *
 * @param string The string to clean
 *
 * @returns Returns the cleaned string ready to be used as a key.
 */
function cleanName(string: string): string {
  return replace(string, / /g, '_')
}

function cleanAspectName(schema: VEOObjectSchemaRAW, aspectName: string) {
  return aspectName.replace(`${schema.title.toLowerCase()}_`, '')
}

function cleanAttributeName(aspectName: string, attributeName: string) {
  return attributeName.replace(`${aspectName}_`, '')
}

/**
 * Merges an array of custom options with the default options. Properties that are set in
 * both are replaced with the custom option property.
 *
 * @param options The custom options array to apply.
 */
function mergeWithDefaultOptions(options?: IObjectSchemaHelperOptions): IHelperOptions {
  const _options: IHelperOptions = {
    customProperties: CUSTOM_PROPERTIES
  }

  _options.customProperties = (options?.customProperties) ?? CUSTOM_PROPERTIES
  return _options
}

export function prefixedAspectName(schema: VEOObjectSchemaRAW, aspectName: string): string {
  return `${cleanName(schema.title.toLowerCase())}_${cleanName(aspectName)}`
}

export function prefixedAttributeName(schema: VEOObjectSchemaRAW, aspectName: string): string {
  return `${prefixedAspectName(schema, aspectName)}_`
}

/**
 * Generates the basic VEOObjectSchema to which custom links and custom aspects can get added.
 *
 * @returns Returns the basic schema to be modified further.
 */
export function generateSchema(type: string, description?: string): VEOObjectSchemaRAW {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      abbreviation: {
        type: 'string',
        description: 'The abbreviation for the EntityLayerSupertype.'
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
            type: 'string'
          },
          searchesUri: {
            type: 'string'
          },
          targetUri: {
            type: 'string',
            description: 'The resource URL of the referenced unit.'
          }
        },
        required: ['targetUri'],
        description: 'A reference to the unit containing this entity.'
      },
      validFrom: {
        type: 'string',
        description: 'A timestamp acc. to RFC 3339 specifying when this version of the entity was saved.'
      }
    },
    required: ['name', 'owner'],
    title: type,
    description: description || ''
  }
}

export function renameSchema(schema: VEOObjectSchemaRAW, newName: string, options?: IObjectSchemaHelperOptions) {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const oldName = schema.title.toLowerCase()

  for (const aspect in schema.properties[OPTIONS.customProperties.customAspects].properties) {
    const newAspectTitle = aspect.replace(oldName, newName)
    schema.properties[OPTIONS.customProperties.customAspects].properties[newAspectTitle] = schema.properties[OPTIONS.customProperties.customAspects].properties[aspect]
    delete schema.properties[OPTIONS.customProperties.customAspects].properties[aspect]
  }

  for (const link in schema.properties[OPTIONS.customProperties.links].properties) {
    const newLinkTitle = link.replace(oldName, newName)
    schema.properties[OPTIONS.customProperties.links].properties[newLinkTitle] = schema.properties[OPTIONS.customProperties.links].properties[link]
    delete schema.properties[OPTIONS.customProperties.links].properties[link]
  }

  schema.title = newName
}

/**
 * Returns an array containg the value of a basic property of a schema.
 *
 * @param schema The schema to fetch the basic property from.
 * @param property The name of the property to fetch.
 * @param options Optional object to override default options.
 *
 * @returns Returns the basic property. The developer has to specify the type by using the VEOObjectSchema.
 * @throws Throws an error if the property doesn't exist.
 */
export function getBasicProperty(schema: VEOObjectSchemaRAW, property: string, options?: IObjectSchemaHelperOptions): IVEOBasicProperty {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  if (!schema.properties[property] || OPTIONS.customProperties?.[property]) {
    throw new Error(`ObjectSchemaHelper::getBasicProperty: Property ${property} not found or not a basic property!`)
  }

  return {
    raw: schema.properties[property],
    type: schema.properties[property].type,
    title: property,
    description: schema.properties[property].description
  }
}

/**
 * Returns an array containg all basic properties of a schema.
 *
 * @param schema The schema to fetch the custom links for.
 * @param options Optional object to override default options.
 *
 * @returns Returns an array containg all basic properties. The developer has to specify the type by using the VEOObjectSchema.
 */
export function getBasicProperties(schema: VEOObjectSchemaRAW, options?: IObjectSchemaHelperOptions): IVEOBasicProperty[] {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const values: IVEOBasicProperty[] = []
  for (const property in schema.properties) {
    // If the property is included in the custom properties object, it isn't basic so we ignore it.
    if (!OPTIONS.customProperties?.[property]) {
      values.push({
        raw: schema.properties[property],
        type: schema.properties[property].type,
        title: property,
        description: schema.properties[property].description
      })
    }
  }
  return values
}

/**
 * Returns a custom aspect from the schema.
 *
 * @param schema The schema to retrieve the custom aspect from.
 * @param name The name of the custom aspect to retrieve.
 * @param options Optional object to override default options.
 *
 * @returns Returns the aspect.
 * @throws Throws an error if the aspect couldn't be found.
 */
export function getAspect(schema: VEOObjectSchemaRAW, name: string, options?: IObjectSchemaHelperOptions): IVEOCustomAspect {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  if (schema.properties[OPTIONS.customProperties.customAspects].properties[name]) {
    return {
      raw: schema.properties[OPTIONS.customProperties.customAspects].properties[name],
      title: cleanAspectName(schema, name),
      attributes: getAspectAttributes(schema, name)
    }
  }
  throw new Error(`ObjectSchemaHelper::getAspect: ${name} Aspect not found!`)
}

/**
 * Returns an array containg all custom aspects of a schema.
 *
 * @param schema The schema to fetch the custom aspects from.
 * @param options Optional object to override default options.
 */
export function getAspects(schema: VEOObjectSchemaRAW, options?: IObjectSchemaHelperOptions): IVEOCustomAspect[] {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const values: IVEOCustomAspect[] = []
  for (const aspect in schema.properties[OPTIONS.customProperties.customAspects].properties) {
    values.push(getAspect(schema, aspect))
  }
  return values
}

/**
 * Returns an array containg all attributes of a custom aspect.
 *
 * @param schema The schema to fetch the custom aspect from.
 * @param aspect The custom aspect to fetch the attributes from.
 * @param options Optional object to override default options.
 */
export function getAspectAttributes(schema: VEOObjectSchemaRAW, aspectName: string, options?: IObjectSchemaHelperOptions): IVEOAttribute[] {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const values: IVEOAttribute[] = []

  const aspect = schema.properties[OPTIONS.customProperties.customAspects].properties[aspectName]

  for (const attribute in aspect.properties.attributes.properties) {
    values.push({
      raw: aspect.properties.attributes.properties[attribute],
      title: cleanAttributeName(aspectName, attribute),
      type: aspect.properties.attributes.properties[attribute].type ? aspect.properties.attributes.properties[attribute].type : (aspect.properties.attributes.properties[attribute]) ? 'enum' : 'default',
      description: aspect.properties.attributes.properties[attribute].title,
      enum: aspect.properties.attributes.properties[attribute].enum
    })
  }
  return values
}

/**
 * Generates an aspect that can get added to the schema later on.
 *
 * @param name The name of the new aspect.
 *
 * @returns Returns the aspect to be further modified.
 */
export function generateAspect(): VEOCustomAspectRAW {
  return {
    type: 'object',
    required: ['type'],
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
}

/**
 * Adds a new custom aspect to the given schema.
 *
 * @param schema The schema to add the custom aspect to.
 * @param aspect The custom aspect to add.
 * @param options Optional object to override default options.
 *
 * @throws Throws an error if the custom aspect already exists. Use updateAspectInSchema in this case.
 */
export function addAspectToSchema(schema: VEOObjectSchemaRAW, aspectName: string, aspect: VEOCustomAspectRAW, options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)
  const aspectId = prefixedAspectName(schema, aspectName)

  if (schema.properties[OPTIONS.customProperties.customAspects].properties[aspectId]) {
    throw new Error(`ObjectSchemaHelper::addAspectToSchema: Aspect ${aspectId} already exists!`)
  }

  schema.properties[OPTIONS.customProperties.customAspects].properties[aspectId] = aspect
}

/**
 * Updates an existing custom aspect in a given schema (including attributes).
 *
 * @param schema The schema to update the custom aspect in.
 * @param aspect The aspect to update. (Completely overrides the current aspect.)
 * @param options Optional object to override default options.
 *
 * @throws Throws an error if the custom aspect isn't existing.
 */
export function updateAspectInSchema(schema: VEOObjectSchemaRAW, aspect: IVEOCustomAspect, options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const rawTitle = prefixedAspectName(schema, aspect.title)

  if (!schema.properties[OPTIONS.customProperties.customAspects].properties[rawTitle]) {
    throw new Error(`ObjectSchemaHelper::updateAspectInSchema: Aspect ${rawTitle} not found!`)
  }
  schema.properties[OPTIONS.customProperties.customAspects].properties[rawTitle].properties.type.enum[0] = rawTitle
  updateAspectAttributes(schema, aspect, aspect.attributes)
}

/**
 * Deletes an aspect from the schema.
 *
 * @param schema The schema to delete the aspect from.
 * @param aspect The id of the aspect to delete.
 * @param options Optional object to override default options.
 */
export function deleteAspect(schema: VEOObjectSchemaRAW, aspect: string, options?: IObjectSchemaHelperOptions) {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const rawTitle = prefixedAspectName(schema, aspect)

  if (!schema.properties[OPTIONS.customProperties.customAspects].properties[rawTitle]) {
    throw new Error(`ObjectSchemaHelper::deleteAspect: Aspect ${rawTitle} not found!`)
  }
  delete schema.properties[OPTIONS.customProperties.customAspects].properties[rawTitle]
}

/**
 * Adds an attribute to an existing custom aspect in a given schema.
 *
 * @param schema The schema to edit.
 * @param aspect The aspect to add the attribute to.
 * @param attribute The attribute to add.
 * @param options Optional object to override default options.
 *
 * @throws Throws an error if the custom aspect couldn't be found.
 */
export function addAttributeToAspect(schema: VEOObjectSchemaRAW, aspect: IVEOCustomAspect | string, attribute: IVEOAttribute, options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const aspectName = (isObject(aspect)) ? prefixedAspectName(schema, aspect.title) : aspect
  const attributeName = aspectName + '_' + cleanName(attribute.title)

  if (!schema.properties[OPTIONS.customProperties.customAspects].properties[aspectName]) {
    throw new Error(`ObjectSchemaHelper::addAttributeToAspect: Aspect ${aspectName} not found!`)
  }

  // Overwrite the title of the attribute with the description (the title only gets used as a key)
  attribute.title = attribute.description
  // Unset properties specifically created for VEOCustomAspect that don't belong to the json schema.
  delete (attribute as any).raw
  delete (attribute as any).description

  // JSON Schema doesn't support extending types, so we have to delete the type. Else the form schema editor won't load it.
  if(attribute.type === 'enum') {
    delete (attribute as any).type
  } else {
    delete (attribute as any).enum
  }

  // Overwrite old property with new one.
  schema.properties[OPTIONS.customProperties.customAspects].properties[aspectName].properties.attributes.properties[attributeName] = attribute
}

/**
 * Updates ALL attributes of an existing custom aspect in a given schema.
 *
 * @param schema The schema to edit.
 * @param aspect The aspect to add the attribute to.
 * @param attributes All new attributes of the custom aspect.
 * @param options Optional object to override default options.
 *
 * @throws Throws an error  if the custom aspect to update the attributes of couldn't be found.
 */
export function updateAspectAttributes(schema: VEOObjectSchemaRAW, aspect: IVEOCustomAspect | string, attributes: IVEOAttribute[], options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const aspectName = (isObject(aspect)) ? prefixedAspectName(schema, aspect.title) : aspect

  if (!schema.properties[OPTIONS.customProperties.customAspects].properties[aspectName]) {
    throw new Error(`ObjectSchemaHelper::updateAspectAttributes: Aspect ${aspectName} not found!`)
  }

  schema.properties[OPTIONS.customProperties.customAspects].properties[aspectName].properties.attributes.properties = {}
  for (const attribute of attributes) {
    addAttributeToAspect(schema, aspectName, attribute)
  }
}

/**
 * Renames an aspect
 *
 * @param schema The schema to rename the aspect in.
 * @param link The aspect to rename.
 * @param newTitle The new title of the aspect.
 * @param options Optional object to override default options.
 *
 * @throws Throws an error if the old aspect couldn't be found.
 */
export function renameAspect(schema: VEOObjectSchemaRAW, aspect: IVEOCustomAspect, newTitle: string, options?: IObjectSchemaHelperOptions):void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const rawTitle = prefixedAspectName(schema, aspect.title)
  newTitle = prefixedAspectName(schema, newTitle)

  if (!schema.properties[OPTIONS.customProperties.customAspects].properties[rawTitle]) {
    throw new Error(`ObjectSchemaHelper::renameAspect: Old aspect ${rawTitle} not found!`)
  }

  schema.properties[OPTIONS.customProperties.customAspects].properties[newTitle] = schema.properties[OPTIONS.customProperties.customAspects].properties[rawTitle]
  delete schema.properties[OPTIONS.customProperties.customAspects].properties[rawTitle]
}

/**
 * Returns a custom link from the schema.
 *
 * @param schema The schema to retrieve the custom link from.
 * @param name The name of the custom link to retrieve.
 * @param options Optional object to override default options.
 *
 * @returns Returns the link.
 * @throws Throws an error if the custom link couldn't be found.
 */
export function getLink(schema: VEOObjectSchemaRAW, name: string, options?: IObjectSchemaHelperOptions): IVEOCustomLink {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  if (schema.properties[OPTIONS.customProperties.links].properties[name]) {
    return {
      raw: schema.properties[OPTIONS.customProperties.links].properties[name],
      title: cleanAspectName(schema, name),
      attributes: getLinkAttributes(schema, name),
      target: {
        type: schema.properties[OPTIONS.customProperties.links].properties[name].items.properties.target.properties.type.enum[0],
        description: schema.properties[OPTIONS.customProperties.links].properties[name].items.properties.target.title
      }
    }
  }
  throw new Error('ObjectSchemaHelper::getLink: Link not found!')
}

/**
 * Returns an array containg all custom links of a schema.
 *
 * @param schema The schema to fetch the custom links for.
 * @param options Optional object to override default options.
 */
export function getLinks(schema: VEOObjectSchemaRAW, options?: IObjectSchemaHelperOptions): IVEOCustomLink[] {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const values: IVEOCustomLink[] = []
  for (const link in schema.properties[OPTIONS.customProperties.links].properties) {
    values.push(getLink(schema, link))
  }
  return values
}

/**
 * Returns an array containg all attributes of a custom link.
 *
 * @param schema The schema to fetch the custom link from.
 * @param link The custom link to fetch the attributes from.
 * @param options Optional object to override default options.
 */
export function getLinkAttributes(schema: VEOObjectSchemaRAW, linkName: string, options?: IObjectSchemaHelperOptions): IVEOAttribute[] {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const values: IVEOAttribute[] = []

  const link = schema.properties[OPTIONS.customProperties.links].properties[linkName]
  for (const attribute in link.items.properties.attributes.properties) {
    values.push({
      raw: link.items.properties.attributes.properties[attribute],
      title: cleanAttributeName(linkName, attribute),
      type: link.items.properties.attributes.properties[attribute].type ? link.items.properties.attributes.properties[attribute].type : (link.items.properties.attributes.properties[attribute]) ? 'enum' : 'default',
      description: link.items.properties.attributes.properties[attribute].title
    })
  }
  return values
}

/**
 * Generates a custom link that can get added to the schema later on.
 *
 * @param name The name of the new custom link.
 * @param target The target of the link
 * @param description The target description of the link
 *
 * @returns Returns the custom link to be further modified.
 */
export function generateLink(target: string, description: string): VEOCustomLinkRAW {
  return {
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
          title: description,
          properties: {
            targetUri: {
              type: 'string',
              title: 'The id of the target object.'
            },
            type: {
              enum: [target]
            }
          }
        },
        attributes: {
          type: 'object',
          properties: {}
        }
      },
      additionalProperties: false,
      required: ['type', 'target']
    }
  }
}

/**
 * Adds a new custom link to the given schema.
 *
 * @param schema The schema to add the custom link to.
 * @param link The custom link to add.
 * @param options Optional object to override default options.
 *
 * @throws Throws an error if the custom link already exists. Use updateLinkInSchema in this case.
 */
export function addLinkToSchema(schema: VEOObjectSchemaRAW, linkName: string, link: VEOCustomLinkRAW, options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)
  const linkId = prefixedAspectName(schema, linkName)

  if (schema.properties[OPTIONS.customProperties.links].properties[linkId]) {
    throw new Error(`ObjectSchemaHelper::addLinkToSchema: Link ${linkId} already exists!`)
  }

  schema.properties[OPTIONS.customProperties.links].properties[linkId] = link
}

/**
 * Updates an existing custom link in a given schema.
 *
 * @param schema The schema to update the custom link in.
 * @param link The custom link to update. (Completely overrides the current custom link.)
 * @param options Optional object to override default options.
 *
 * @throws Throws an error if the custom link isn't existing.
 */
export function updateLinkInSchema(schema: VEOObjectSchemaRAW, link: IVEOCustomLink, options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const rawTitle = prefixedAspectName(schema, link.title)

  if (!schema.properties[OPTIONS.customProperties.links].properties[rawTitle]) {
    throw new Error(`ObjectSchemaHelper::updateLinkInSchema: Link ${rawTitle} not found!`)
  }
  schema.properties[OPTIONS.customProperties.links].properties[rawTitle].items.properties.type.enum[0] = rawTitle
  updateLinkAttributes(schema, link, link.attributes)
}

/**
 * Deletes a link from the schema.
 *
 * @param schema The schema to delete the link from.
 * @param link The id of the link to delete.
 * @param options Optional object to override default options.
 */
export function deleteLink(schema: VEOObjectSchemaRAW, link: string, options?: IObjectSchemaHelperOptions) {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const rawTitle = prefixedAspectName(schema, link)

  if (!schema.properties[OPTIONS.customProperties.links].properties[rawTitle]) {
    throw new Error(`ObjectSchemaHelper::deleteLink: Link ${rawTitle} not found!`)
  }
  delete schema.properties[OPTIONS.customProperties.links].properties[rawTitle]
}

/**
 * Adds an attribute to an existing custom link in a given schema.
 *
 * @param schema The schema to edit.
 * @param link The custom link to add the attribute to.
 * @param attribute The attribute to add.
 * @param options Optional object to override default options.
 *
 * @throws Throws an error if the custom link couldn't be found.
 */
export function addAttributeToLink(schema: VEOObjectSchemaRAW, link: IVEOCustomLink | string, attribute: IVEOAttribute, options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const linkName = (isObject(link)) ? prefixedAspectName(schema, link.title) : link
  const attributeName = linkName + '_' + cleanName(attribute.title)

  if (!schema.properties[OPTIONS.customProperties.links].properties[linkName]) {
    throw new Error(`ObjectSchemaHelper::addAttributeToLink: Link ${linkName} not found!`)
  }

  // Overwrite the title of the attribute with the description (the title only gets used as a key)
  attribute.title = attribute.description
  // Unset properties specifically created for VEOCustomAspect that don't belong to the json schema.
  delete (attribute as any).raw
  delete (attribute as any).description

  // Overwrite old property with new one.
  schema.properties[OPTIONS.customProperties.links].properties[linkName].items.properties.attributes.properties[attributeName] = attribute
}

/**
 * Updates ALL attributes of an existing custom link in a given schema.
 *
 * @param schema The schema to edit.
 * @param link The custom link to add the attribute to.
 * @param attributes All new attributes of the custom link.
 * @param options Optional object to override default options.
 *
 * @throws Throws an error if the custom link to update the attributes of couldn't be found.
 */
export function updateLinkAttributes(schema: VEOObjectSchemaRAW, link: IVEOCustomLink | string, attributes: IVEOAttribute[], options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const linkName = (isObject(link)) ? prefixedAspectName(schema, link.title) : link

  if (!schema.properties[OPTIONS.customProperties.links].properties[linkName]) {
    throw new Error(`ObjectSchemaHelper::updateLinkAttributes: Link ${linkName} not found!`)
  }

  schema.properties[OPTIONS.customProperties.links].properties[linkName].items.properties.attributes.properties = {}
  for (const attribute of attributes) {
    addAttributeToLink(schema, linkName, attribute)
  }
}

/**
 * Renames a link
 *
 * @param schema The schema to rename the link in.
 * @param link The link to rename.
 * @param newTitle The new title of the link.
 * @param options Optional object to override default options.
 *
 * @throws Throws an error if the old link couldn't be found.
 */
export function renameLink(schema: VEOObjectSchemaRAW, link: IVEOCustomLink, newTitle: string, options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const rawTitle = prefixedAspectName(schema, link.title)
  newTitle = prefixedAspectName(schema, newTitle)

  if (!schema.properties[OPTIONS.customProperties.links].properties[rawTitle]) {
    throw new Error(`ObjectSchemaHelper::renameLink: Old link ${rawTitle} not found!`)
  }

  schema.properties[OPTIONS.customProperties.links].properties[newTitle] = schema.properties[OPTIONS.customProperties.links].properties[rawTitle]
  delete schema.properties[OPTIONS.customProperties.links].properties[rawTitle]
}

export function updateLinkDetails(schema: VEOObjectSchemaRAW, link: IVEOCustomLink, target: { type: string, description: string }, options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  const rawTitle = prefixedAspectName(schema, link.title)

  schema.properties[OPTIONS.customProperties.links].properties[rawTitle].items.properties.target.title = target.description
  schema.properties[OPTIONS.customProperties.links].properties[rawTitle].items.properties.target.properties.type.enum[0] = target.type
}

export function validate(schema: VEOObjectSchemaRAW): VeoSchemaValidatorValidationResult {
  const validator = new VeoSchemaValidator('OBJECT_SCHEMA')
  return validator.validate(schema, schema.title || undefined)
}

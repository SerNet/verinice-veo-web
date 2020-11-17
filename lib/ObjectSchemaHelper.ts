
import { isObject, replace } from 'lodash'
import { VEOCustomAspectRAW, VEOObjectSchemaRAW, VEOAttributeRAW, VEOCustomLinkRAW, VEOTypeRAW, VEOTypeNameRAW } from 'veo-objectschema-7'

export interface IObjectSchemaHelperOptions {
  customProperties?: Record<string, string>
}

export interface IVEOAttribute {
  raw?: VEOAttributeRAW
  type: VEOTypeRAW
  title: string
  description: string
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
  return replace(string.toLowerCase(), / /g, '_')
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

/**
 * Generates the basic VEOObjectSchema to which custom links and custom aspects can get added.
 *
 * @returns Returns the basic schema to be modified further.
 */
export function generateSchema(): VEOObjectSchemaRAW {
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
    title: 'Process',
    description: 'Schema for Process'
  }
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
      title: schema.properties[OPTIONS.customProperties.customAspects].properties[name].properties.type.enum[0],
      attributes: getAspectAttributes(undefined, schema.properties[OPTIONS.customProperties.customAspects].properties[name])
    }
  }
  throw new Error('ObjectSchemaHelper::getAspect: Aspect not found!')
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
export function getAspectAttributes(schema: VEOObjectSchemaRAW | undefined, aspect: VEOCustomAspectRAW | string, options?: IObjectSchemaHelperOptions): IVEOAttribute[] {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  if (!schema && !isObject(aspect)) {
    throw new Error('ObjectSchemaHelper::getAspectAttributes: If no schema is passed, a custom aspect has to be the second parameter!')
  }

  const values: IVEOAttribute[] = []

  // If the schema is set and the aspect is a string, we access it in the schema, else we already have the aspect object and don't need to do anything.
  if (schema && !isObject(aspect)) {
    aspect = schema.properties[OPTIONS.customProperties.customAspects].properties[aspect]
  }
  aspect = aspect as VEOCustomAspectRAW
  for (const attribute in aspect.properties.attributes.properties) {
    values.push({
      raw: aspect.properties.attributes.properties[attribute],
      title: attribute,
      type: aspect.properties.attributes.properties[attribute].type ? aspect.properties.attributes.properties[attribute].type : (aspect.properties.attributes.properties[attribute]) ? 'enum' : 'default',
      description: aspect.properties.attributes.properties[attribute].title
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
export function generateAspect(name: string): VEOCustomAspectRAW {
  const cleanedName = cleanName(name)
  return {
    type: 'object',
    required: ['type'],
    additionalAttributes: false,
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
      type: {
        description: 'The name of the type described by this schema.',
        enum: [cleanedName]
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
export function addAspectToSchema(schema: VEOObjectSchemaRAW, aspect: VEOCustomAspectRAW, options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  if (schema.properties[OPTIONS.customProperties.customAspects].properties[aspect.properties.type.enum[0]]) {
    throw new Error(`ObjectSchemaHelper::addAspectToSchema: Aspect ${aspect.properties.type.enum[0]} already exists!`)
  }
  schema.properties[OPTIONS.customProperties.customAspects].properties[aspect.properties.type.enum[0]] = aspect
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

  if (!schema.properties[OPTIONS.customProperties.customAspects].properties[aspect.title]) {
    throw new Error(`ObjectSchemaHelper::updateAspectInSchema: Aspect ${aspect.title} not found!`)
  }
  schema.properties[OPTIONS.customProperties.customAspects].properties[aspect.title].properties.type.enum[0] = aspect.title
  updateAspectAttributes(schema, aspect, aspect.attributes)
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

  const aspectName = (isObject(aspect)) ? aspect.title : aspect
  const attributeName = aspectName + '_' + cleanName(attribute.title)

  if (!schema.properties[OPTIONS.customProperties.customAspects].properties[aspectName]) {
    throw new Error(`ObjectSchemaHelper::addAttributeToAspect: Aspect ${aspectName} not found!`)
  }

  // Overwrite the title of the attribute with the description (the title only gets used as a key)
  attribute.title = attribute.description
  // Unset properties specifically created for VEOCustomAspect that don't belong to the json schema.
  delete (attribute as any).raw
  delete (attribute as any).description

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

  const aspectName = (isObject(aspect)) ? aspect.title : aspect

  if (!schema.properties[OPTIONS.customProperties.customAspects].properties[aspectName]) {
    throw new Error(`ObjectSchemaHelper::updateAspectAttributes: Aspect ${aspectName} not found!`)
  }

  schema.properties[OPTIONS.customProperties.customAspects].properties[aspectName].properties.attributes.properties = {}
  for (const attribute of attributes) {
    addAttributeToAspect(schema, aspectName, attribute)
  }
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
      title: schema.properties[OPTIONS.customProperties.links].properties[name].items.properties.type.enum[0],
      attributes: getLinkAttributes(undefined, schema.properties[OPTIONS.customProperties.links].properties[name])
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
export function getLinkAttributes(schema: VEOObjectSchemaRAW | undefined, link: VEOCustomLinkRAW | string, options?: IObjectSchemaHelperOptions): IVEOAttribute[] {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  if (!schema && !isObject(link)) {
    throw new Error('ObjectSchemaHelper::getLinkAttributes: If no schema is passed, a custom link has to be the second parameter!')
  }

  const values: IVEOAttribute[] = []

  // If the schema is set and the link is a string, we access it in the schema, else we already have the link object and don't need to do anything.
  if (schema && !isObject(link)) {
    link = schema.properties[OPTIONS.customProperties.links].properties[link]
  }
  link = link as VEOCustomLinkRAW
  for (const attribute in link.items.properties.attributes.properties) {
    values.push({
      raw: link.items.properties.attributes.properties[attribute],
      title: attribute,
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
export function generateLink(name: string, target: string, description: string): VEOCustomLinkRAW {
  const linkName = cleanName(name)

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
        type: {
          description: 'The name of the type described by this schema.',
          enum: [linkName]
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
export function addLinkToSchema(schema: VEOObjectSchemaRAW, link: VEOCustomLinkRAW, options?: IObjectSchemaHelperOptions): void {
  const OPTIONS: IHelperOptions = mergeWithDefaultOptions(options)

  if (schema.properties[OPTIONS.customProperties.links].properties[link.items.properties.type.enum[0]]) {
    throw new Error(`ObjectSchemaHelper::addLinkToSchema: Link ${link.items.properties.type.enum[0]} already exists!`)
  }
  schema.properties[OPTIONS.customProperties.links].properties[link.items.properties.type.enum[0]] = link
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

  if (!schema.properties[OPTIONS.customProperties.links].properties[link.title]) {
    throw new Error(`ObjectSchemaHelper::updateLinkInSchema: Link ${link.title} not found!`)
  }
  schema.properties[OPTIONS.customProperties.links].properties[link.title].items.properties.type.enum[0] = link.title
  updateLinkAttributes(schema, link, link.attributes)
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

  const linkName = (isObject(link)) ? link.title : link
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

  const linkName = (isObject(link)) ? link.title : link

  if (!schema.properties[OPTIONS.customProperties.links].properties[linkName]) {
    throw new Error(`ObjectSchemaHelper::updateLinkAttributes: Link ${linkName} not found!`)
  }

  schema.properties[OPTIONS.customProperties.links].properties[linkName].items.properties.attributes.properties = {}
  for (const attribute of attributes) {
    addAttributeToLink(schema, linkName, attribute)
  }
}

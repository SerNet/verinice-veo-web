import { isArray, isObject, snakeCase } from 'lodash'
import ObjectSchemaHelper from './ObjectSchemaHelper2'

export type VeoSchemaValidatorRequiredProperty = string | { key: string, value: any }

export interface VeoSchemaValidatorProperty {
  name: string
  type?: string
  optional?: boolean
  additionalProperties?: VeoSchemaValidatorProperty[]
  requiredAdditionalProperties?: VeoSchemaValidatorRequiredProperty[]
  childProperties?: VeoSchemaValidatorProperty[]
  requiredChildProperties?: VeoSchemaValidatorRequiredProperty[]
}

export interface VeoSchemaValidatorMessage {
  code: string
  message: string
}

export interface VeoSchemaValidatorValidationResult {
  valid: boolean
  errors: VeoSchemaValidatorMessage[]
  warnings: VeoSchemaValidatorMessage[]
}

export default class ObjectSchemaValidator {
  private errors: VeoSchemaValidatorMessage[] = []
  private warnings: VeoSchemaValidatorMessage[] = []

  public fitsObjectSchema(schema: any, data: any): boolean {
    let isFitting = true
    const helper = new ObjectSchemaHelper(schema)

    for (let attribute in data) {
      if (attribute === 'customAspects') {
        for (let customAspect in data.customAspects) {
          const customAspectTitle = customAspect.split('_').pop() || ''
          // check if custom aspect exists
          if (!helper.getCustomAspect(customAspectTitle)) {
            isFitting = false
            continue
          }
          // check if all attributes of custom aspect exist
          for (let customAspectAttribute in data.customAspects[customAspect].attributes) {
            if (!helper.getCustomAspect(customAspectTitle)?.attributes.find(a => (a.prefix + a.title).endsWith(customAspectAttribute))) {
              isFitting = false
            }
          }
        }
      } else if (attribute === 'links') {
        for (let link in data.links) {
          const linkTitle = link.split('_').pop() || ''
          // check if custom link exists
          if (!helper.getCustomLink(linkTitle)) {
            isFitting = false
            continue
          }
          // check if all attributes of custom link exists
          for (let linkAttribute in data.links[link].attributes) {
            if (!helper.getCustomLink(linkTitle)?.attributes.find(a => (a.prefix + a.title).endsWith(linkAttribute))) {
              isFitting = false
            }
          }
        }
      } else {
        if (!helper.getBasicProperties().map(b => b.title).includes(attribute)) {
          isFitting = false
        }
      }
    }
    return isFitting
  }

  public validate(schema: any, context: string = 'schema'): VeoSchemaValidatorValidationResult {
    if (!schema.title) {
      this.errors.push({ code: 'E_SCHEMA_PROPERTY_MISSING', message: `The schema "${context}" is missing the property "title"` })
    }

    this.validateBaseSchema(schema, context)
    this.validateCustomAspects(schema, context)
    this.validateCustomLinks(schema, context)

    return { valid: this.errors.length === 0, errors: this.errors, warnings: this.warnings }
  }

  private validateCustomAspects(schema: any, context: string): void {
    if (!schema.properties.customAspects) {
      this.errors.push({ code: 'E_ASPECTS_MISSING', message: `The custom aspects property couldn\'t be found (Searched for ${context}.properties.customAspects` })
    } else if (!schema.properties.customAspects.properties) {
      this.errors.push({ code: 'E_ASPECTS_MISSING', message: `The custom aspects property couldn\'t be found (Searched for ${context}.properties.customAspects.properties` })
    } else {
      for (const aspect of Object.keys(schema.properties.customAspects.properties)) {
        this.validateName(schema.title, aspect, `${context}.properties.customAspects.properties.${aspect}`)
        this.validateAspect(schema.properties.customAspects.properties[aspect], `${context}.properties.customAspects.properties.${aspect}`)
      }
    }
  }

  private validateCustomLinks(schema: any, context: string): void {
    if (!schema.properties.links) {
      this.errors.push({ code: 'E_LINKS_MISSING', message: `The custom links property couldn\'t be found (Searched for ${context}.properties.links` })
    } else if (!schema.properties.links.properties) {
      this.errors.push({ code: 'E_LINKS_MISSING', message: `The custom links property couldn\'t be found (Searched for ${context}.properties.links.properties` })
    } else {
      for (const link of Object.keys(schema.properties.links.properties)) {
        this.validateName(schema.title, link, `${context}.links.properties.${link}`)
        this.validateLink(schema.properties.links.properties[link], `${context}.links.properties.${link}`)
      }
    }
  }

  private validateName(schemaName: string, linkTitle: string, context: string): void {
    if (!linkTitle.includes(snakeCase(schemaName) + '_')) {
      this.warnings.push({ code: 'W_INCORRECT_NAMING', message: `${linkTitle} is not following the naming conventions (<schema name>_<link/aspect name>) ${context}` })
    }
  }

  private validateLink(link: any, context: string): void {
    if (!link.items.properties) {
      this.errors.push({ code: 'E_LINK_INVALID', message: `The custom link "${context}" is missing its properties.` })
    } else if (!link.items.properties.target.properties.type.enum) {
      this.errors.push({ code: 'E_LINK_TARGET_INVALID', message: `The custom links (${context}) target is missing or malformed.` })
    } else {
      const dummy = ObjectSchemaHelper.generateLinkSchema({
        description: '',
        targetType: link.items.properties.target.properties.type.enum,
        title: link.items.properties.target.title,
        attributes: []
      })
      const attributes = link.items.properties.attributes.properties

      for (const property of Object.keys(dummy.items.properties)) {
        if (!link.items.properties[property]) {
          this.warnings.push({ code: 'W_LINK_PROPERTY_MISSING', message: `The custom link "${context}" is missing the property ${property}.` })
        }
      }

      for (const attribute of Object.keys(attributes)) {
        this.validateType(attributes[attribute], `${context}.${attribute}`)
      }
    }
  }

  private validateAspect(aspect: any, context: string): void {
    const dummy = ObjectSchemaHelper.generateAspectSchema({
      title: '',
      attributes: []
    })
    const attributes = aspect.properties.attributes.properties

    for (const property of Object.keys(dummy.properties)) {
      if (!aspect.properties[property]) {
        this.warnings.push({ code: 'W_ASPECT_PROPERTY_MISSING', message: `The custom aspect "${context}" is missing the property ${property}.` })
      }
    }

    for (const attribute of Object.keys(attributes)) {
      this.validateType(attributes[attribute], `${context}.${attribute}`)
    }
  }

  private validateType(attribute: any, context: string) {
    if (!attribute.type) {
      // Type is not required and NOT set for enums, so we skip this check
      // this.warnings.push({ code: 'W_NO_ATTRIBUTE_TYPE', message: `The attribute ${context} has no type. Skipping validation...` })
    } else {
      switch (attribute.type) {
        case 'enum':
          if (!attribute.enum || !isArray(attribute.enum)) {
            this.errors.push({ code: 'E_ATTRIBUTE_MISSING_PROPERTY', message: `The attribute ${context} is missing the property "enum". Required for "type: enum"` })
          }
          break
        case 'array':
          if (!attribute.items || !isObject(attribute.items)) {
            this.errors.push({ code: 'E_ATTRIBUTE_MISSING_PROPERTY', message: `The attribute ${context} is missing the property "items". Required for "type: array"` })
          }
          break
        case 'object':
          if (!attribute.properties || !isObject(attribute.properties)) {
            this.errors.push({ code: 'E_ATTRIBUTE_MISSING_PROPERTY', message: `The attribute ${context} is missing the property "properties". Required for "type: object"` })
          }
          break
      }
    }
  }

  private validateBaseSchema(schema: any, context: string) {
    const requiredKeys: string[] = ['abbreviation', 'description', 'domains', 'id', 'name', 'owner', 'subType']

    for (const key of requiredKeys) {
      if (schema.properties[key] === undefined) {
        this.errors.push({ code: 'E_SCHEMA_PROPERTY_MISSING', message: `${context} is missing the required property ${key}` })
      }
    }
  }
}

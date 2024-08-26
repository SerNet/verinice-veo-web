/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann, Davit Svandize
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import type { ComposerTranslation } from 'vue-i18n';
import { isArray, isObject } from 'lodash';
import ObjectSchemaHelper from './ObjectSchemaHelper2';

export type VeoSchemaValidatorRequiredProperty = string | { key: string; value: any };

export interface VeoSchemaValidatorProperty {
  name: string;
  type?: string;
  optional?: boolean;
  additionalProperties?: VeoSchemaValidatorProperty[];
  requiredAdditionalProperties?: VeoSchemaValidatorRequiredProperty[];
  childProperties?: VeoSchemaValidatorProperty[];
  requiredChildProperties?: VeoSchemaValidatorRequiredProperty[];
}

export interface VeoSchemaValidatorMessage {
  code: string;
  message: string;
  params?: Record<string, any>;
  actions?: {
    key: string;
    title: string | ((t: ComposerTranslation) => string);
    callback: CallableFunction;
  }[];
}

export interface VeoSchemaValidatorValidationResult {
  valid: boolean;
  errors: VeoSchemaValidatorMessage[];
  warnings: VeoSchemaValidatorMessage[];
  information?: VeoSchemaValidatorMessage[];
}

/*
 * If a property is missing on an object schema that is set in an object. It can't be restored or viewed. However some
 * Properties are added in later on on the backend side to provide some sort of meta data.
 * Those won't exist in the scheme so they should get ignored if checking an object.
 */
const NON_REQUIRED_PROPERTIES = ['members', 'parts', 'domains', 'designator', 'type', 'displayName'];

export default class ObjectSchemaValidator {
  private errors: VeoSchemaValidatorMessage[] = [];
  private warnings: VeoSchemaValidatorMessage[] = [];
  private domainSpecificObjectSchema = true;

  constructor(domainSpecificObjectSchema: boolean) {
    this.domainSpecificObjectSchema = domainSpecificObjectSchema;
  }

  public static fitsObjectSchema(schema: any, data: any): VeoSchemaValidatorValidationResult {
    const errors: VeoSchemaValidatorMessage[] = [];
    const helper = new ObjectSchemaHelper(schema, undefined, {
      domainSpecificObjectSchema: true
    });

    for (const attribute in data) {
      if (NON_REQUIRED_PROPERTIES.includes(attribute)) {
        continue;
      }
      switch (attribute) {
        case 'customAspects':
          for (const customAspect in data.customAspects) {
            const customAspectTitle = customAspect.split('_').pop() || '';
            // check if custom aspect exists
            if (!helper.getCustomAspect(customAspectTitle)) {
              errors.push({
                code: 'E_ASPECT_MISSING',
                message: `The aspect "${customAspectTitle}" is missing in the schema "${schema.title}"`
              });
              continue;
            }
            // check if all attributes of custom aspect exist
            for (const customAspectAttribute in data.customAspects[customAspect].attributes) {
              if (
                !helper
                  .getCustomAspect(customAspectTitle)
                  ?.attributes.find((a) => (a.prefix + a.title).endsWith(customAspectAttribute))
              ) {
                errors.push({
                  code: 'E_ATTRIBUTE_MISSING',
                  message: `The attribute "${customAspectTitle}_${customAspectAttribute}" is missing in the schema "${schema.title}"`
                });
              }
            }
          }
          break;
        case 'links':
          for (const link in data.links) {
            const linkTitle = link.split('_').pop() || '';
            // check if custom link exists
            if (!helper.getCustomLink(linkTitle)) {
              errors.push({
                code: 'E_LINK_MISSING',
                message: `The link "${linkTitle}" is missing in the schema "${schema.title}"`
              });
              continue;
            }
            // check if all attributes of custom link exists
            for (const linkAttribute in data.links[link].attributes) {
              if (
                !helper.getCustomLink(linkTitle)?.attributes.find((a) => (a.prefix + a.title).endsWith(linkAttribute))
              ) {
                errors.push({
                  code: 'E_ATTRIBUTE_MISSING',
                  message: `The attribute "${linkTitle}_${linkAttribute}" is missing in the schema "${schema.title}"`
                });
              }
            }
          }
          break;
        default:
          if (
            !helper
              .getBasicProperties()
              .map((b) => b.title)
              .includes(attribute)
          ) {
            errors.push({
              code: 'E_SCHEMA_PROPERTY_MISSING',
              message: `The schema "${schema.title}" is missing the property "${attribute}"`
            });
          }
          break;
      }
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  public validate(schema: any, context = 'schema'): VeoSchemaValidatorValidationResult {
    if (!schema.title) {
      this.errors.push({
        code: 'E_SCHEMA_PROPERTY_MISSING',
        message: `The schema "${context}" is missing the property "title"`
      });
    }

    this.validateBaseSchema(schema, context);
    this.validateCustomAspects(schema, context);
    this.validateCustomLinks(schema, context);

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  private validateCustomAspects(schema: any, context: string): void {
    if (!schema.properties.customAspects) {
      this.errors.push({
        code: 'E_ASPECTS_MISSING',
        message: `The custom aspects property couldn't be found (Searched for ${context}.properties.customAspects`
      });
    } else if (!schema.properties.customAspects.properties) {
      this.errors.push({
        code: 'E_ASPECTS_MISSING',
        message: `The custom aspects property couldn't be found (Searched for ${context}.properties.customAspects.properties`
      });
    } else {
      for (const aspect of Object.keys(schema.properties.customAspects.properties)) {
        this.validateName(schema.title, aspect, `${context}.properties.customAspects.properties.${aspect}`);
        this.validateAspect(
          schema.properties.customAspects.properties[aspect],
          `${context}.properties.customAspects.properties.${aspect}`
        );
      }
    }
  }

  private validateCustomLinks(schema: any, context: string): void {
    if (!schema.properties.links) {
      this.errors.push({
        code: 'E_LINKS_MISSING',
        message: `The custom links property couldn't be found (Searched for ${context}.properties.links`
      });
    } else if (!schema.properties.links.properties) {
      this.errors.push({
        code: 'E_LINKS_MISSING',
        message: `The custom links property couldn't be found (Searched for ${context}.properties.links.properties`
      });
    } else {
      for (const link of Object.keys(schema.properties.links.properties)) {
        this.validateName(schema.title, link, `${context}.links.properties.${link}`);
        this.validateLink(schema.properties.links.properties[link], `${context}.links.properties.${link}`);
      }
    }
  }

  private validateName(schemaName: string, linkTitle: string, context: string): void {
    if (!linkTitle.includes(schemaName + '_')) {
      this.warnings.push({
        code: 'W_INCORRECT_NAMING',
        message: `${linkTitle} is not following the naming conventions (<schema name>_<link/aspect name>) ${context}`
      });
    }
  }

  private validateLink(link: any, context: string): void {
    if (!link.items.properties) {
      this.errors.push({
        code: 'E_LINK_INVALID',
        message: `The custom link "${context}" is missing its properties.`
      });
    } else if (!link.items.properties.target.properties.type.enum) {
      this.errors.push({
        code: 'E_LINK_TARGET_INVALID',
        message: `The custom links (${context}) target is missing or malformed.`
      });
    } else {
      const dummy = ObjectSchemaHelper.generateLinkSchema({
        targetType: link.items.properties.target.properties.type.enum,
        title: link.items.properties.target.title,
        attributes: []
      });
      const attributes = link.items.properties.attributes.properties;

      for (const property of Object.keys(dummy.items.properties)) {
        if (!link.items.properties[property]) {
          this.warnings.push({
            code: 'W_LINK_PROPERTY_MISSING',
            message: `The custom link "${context}" is missing the property ${property}.`
          });
        }
      }

      for (const attribute of Object.keys(attributes)) {
        this.validateType(attributes[attribute], `${context}.${attribute}`);
      }
    }
  }

  private validateAspect(aspect: any, context: string): void {
    const dummy = ObjectSchemaHelper.generateAspectSchema(
      {
        title: '',
        attributes: []
      },
      this.domainSpecificObjectSchema
    );
    const attributes = aspect.properties.attributes.properties;

    for (const property of Object.keys(dummy.properties)) {
      if (!aspect.properties[property]) {
        this.warnings.push({
          code: 'W_ASPECT_PROPERTY_MISSING',
          message: `The custom aspect "${context}" is missing the property ${property}.`
        });
      }
    }

    for (const attribute of Object.keys(attributes)) {
      this.validateType(attributes[attribute], `${context}.${attribute}`);
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
            this.errors.push({
              code: 'E_ATTRIBUTE_MISSING_PROPERTY',
              message: `The attribute ${context} is missing the property "enum". Required for "type: enum"`
            });
          }
          break;
        case 'array':
          if (!attribute.items || !isObject(attribute.items)) {
            this.errors.push({
              code: 'E_ATTRIBUTE_MISSING_PROPERTY',
              message: `The attribute ${context} is missing the property "items". Required for "type: array"`
            });
          }
          break;
        case 'object':
          if (!attribute.properties || !isObject(attribute.properties)) {
            this.errors.push({
              code: 'E_ATTRIBUTE_MISSING_PROPERTY',
              message: `The attribute ${context} is missing the property "properties". Required for "type: object"`
            });
          }
          break;
      }
    }
  }

  private validateBaseSchema(schema: any, context: string) {
    const requiredKeys: string[] = ['abbreviation', 'description', 'domains', 'id', 'name', 'owner'];

    for (const key of requiredKeys) {
      if (schema.properties[key] === undefined) {
        this.errors.push({
          code: 'E_SCHEMA_PROPERTY_MISSING',
          message: `${context} is missing the required property ${key}`
        });
      }
    }
  }
}

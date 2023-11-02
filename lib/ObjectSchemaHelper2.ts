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
import { cloneDeep, merge, trim } from 'lodash';

import ObjectSchemaValidator, { VeoSchemaValidatorValidationResult } from './ObjectSchemaValidator';
import {
  IVeoObjectSchema,
  IVeoObjectSchemaCustomAspect,
  IVeoObjectSchemaCustomLink,
  IVeoObjectSchemaProperty,
  IVeoObjectSchemaTranslations,
  IVeoTranslationCollection
} from '~/types/VeoTypes';

export interface IVeoOSHCustomProperty {
  title: string;
  type: string;
  description?: string;
  prefix?: string;
  multiple?: boolean;
  format?: string;
  pattern?: string;
  enum?: any[];
  originalId?: string;
}

export interface IVeoOSHCustomAspect {
  title: string;
  attributes: IVeoOSHCustomProperty[];
  prefix?: string;
}

export interface IVeoOSHCustomLink extends IVeoOSHCustomAspect {
  targetType: string;
  subType?: string;
}

export interface IVeoOSHOptions {
  customAspectsKey?: string;
  customLinksKey?: string;
  translationsKey?: string;
  domainsKey?: string;
  domainSpecificObjectSchema?: boolean;
}

export interface IVeoOSHDomains {
  [domain: string]: {
    subType: string;
    status: string[];
  }[];
}

/**
 * This class handles creating the schema for object schemas and editing them.
 * Internally, a more developer friendly data structure gets used than the schema itself,
 * which only gets generated by toSchema().
 */
export default class ObjectSchemaHelper {
  private _schema: IVeoObjectSchema;

  private _title: string;

  private _description: string;

  private _customAspects: IVeoOSHCustomAspect[];

  private _customLinks: IVeoOSHCustomLink[];

  private _basicProperties: IVeoOSHCustomProperty[];

  private _translations: { [key: string]: IVeoTranslationCollection };

  private _domains: IVeoOSHDomains;

  private _options: IVeoOSHOptions;

  constructor(objectSchema?: IVeoObjectSchema, domainId?: string, options?: IVeoOSHOptions) {
    this._title = '';
    this._description = '';
    this._customAspects = [];
    this._customLinks = [];
    this._basicProperties = [];
    this._translations = {};
    this._domains = {};

    this._options = { customAspectsKey: 'customAspects', customLinksKey: 'links', translationsKey: 'translations', domainsKey: 'domains', domainSpecificObjectSchema: false };
    merge(this._options, options);

    if (!objectSchema) {
      if (!domainId) {
        throw new Error("ObjectSchemaHelper2::constructor: If you don't pass an objectschema, you have to pass a domain id to generate a new one.");
      }
      this._schema = this.getDefaultSchema(domainId);
      this.loadObjectSchema(this.getDefaultSchema(domainId));
    } else {
      this._schema = JSON.parse(JSON.stringify(objectSchema));
      this._schema.properties.customAspects.properties = {};
      this._schema.properties.links.properties = {};
      this.loadObjectSchema(objectSchema as IVeoObjectSchema);
    }
  }

  public setTitle(value: string) {
    this._title = value;
    this.updateSchemaPrefixes();
  }

  public getTitle(): string {
    return this._title;
  }

  public setDescription(value: string) {
    this._description = value;
  }

  public getDescription(): string {
    return this._description;
  }

  public addCustomAspect(name: string) {
    const aspect: IVeoOSHCustomAspect = {
      title: name,
      prefix: `${this._title}_`,
      attributes: []
    };
    this._customAspects.push(aspect);
  }

  public updateCustomAspect(aspectName: string, aspect: IVeoOSHCustomAspect) {
    const aspectIndex = this._customAspects.findIndex((aspect) => aspect.title === aspectName);

    if (aspectIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::updateCustomAspect: Aspect "${aspectName}" not found!`);
    } else {
      aspect.title = aspectName; // Make sure this method won't rename the aspect, as there are special operations to be executed if that happens
      aspect.prefix = `${this._title}_`;
      this._customAspects[aspectIndex] = cloneDeep(aspect);
      this.updateAspectAttributePrefixes(aspectIndex);
    }
  }

  public updateCustomAspectAttributes(aspectName: string, attributes: IVeoOSHCustomProperty[]) {
    const aspectIndex = this._customAspects.findIndex((aspect) => aspect.title === aspectName);

    if (aspectIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::updateCustomAspectAttributes: Aspect "${aspectName}" not found!`);
    } else {
      this._customAspects[aspectIndex].attributes = attributes;
      this.updateAspectAttributePrefixes(aspectIndex);
    }
  }

  public renameCustomAspect(oldName: string, newName: string) {
    const aspectIndex = this._customAspects.findIndex((aspect) => aspect.title === oldName);

    if (aspectIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::renameCustomAspect: Aspect "${oldName}" not found!`);
    } else {
      this._customAspects[aspectIndex].title = newName;
      this.updateAspectAttributePrefixes(aspectIndex);
    }
  }

  public removeCustomAspect(aspectName: string) {
    const aspectIndex = this._customAspects.findIndex((aspect) => aspect.title === aspectName);

    if (aspectIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::removeCustomAspect: Aspect "${aspectName}" not found!`);
    } else {
      this._customAspects.splice(aspectIndex, 1);
    }
  }

  public getCustomAspects(): IVeoOSHCustomAspect[] {
    return this._customAspects;
  }

  public getCustomAspect(name: string): IVeoOSHCustomAspect | undefined {
    return this._customAspects.find((item) => item.title === name);
  }

  public addCustomLink(name: string, type: string, subType?: string) {
    const link: IVeoOSHCustomLink = {
      title: name,
      prefix: `${this._title}_`,
      attributes: [],
      targetType: type,
      subType
    };
    this._customLinks.push(link);
  }

  public updateCustomLink(linkName: string, link: IVeoOSHCustomLink) {
    const linkIndex = this._customLinks.findIndex((link) => link.title === linkName);

    if (linkIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::updateCustomLink: Link "${linkName}" not found!`);
    } else {
      link.title = linkName; // Make sure this method won't rename the aspect, as there are special operations to be executed if that happens
      link.prefix = `${this._title}_`;
      this._customLinks[linkIndex] = cloneDeep(link);
      this.updateCustomLinkAttributes(linkName, link.attributes);
    }
  }

  public updateCustomLinkAttributes(linkName: string, attributes: IVeoOSHCustomProperty[]) {
    const linkIndex = this._customLinks.findIndex((link) => link.title === linkName);

    if (linkIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::updateCustomLinkAttributes: Link "${linkName}" not found!`);
    } else {
      this._customLinks[linkIndex].attributes = attributes;
      this.updateLinkAttributePrefixes(linkIndex);
    }
  }

  public renameCustomLink(oldName: string, newName: string) {
    const linkIndex = this._customLinks.findIndex((link) => link.title === oldName);

    if (linkIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::renameCustomLink: Link "${oldName}" not found!`);
    } else {
      this._customLinks[linkIndex].title = newName;
      this.updateLinkAttributePrefixes(linkIndex);
    }
  }

  public removeCustomLink(linkName: string) {
    const linkIndex = this._customLinks.findIndex((link) => link.title === linkName);

    if (linkIndex === -1) {
      throw new Error(`ObjectSchemaHelper2::removeCustomLink: Link "${linkName}" not found!`);
    } else {
      this._customLinks.splice(linkIndex, 1);
    }
  }

  public addTranslation(key: string, initialValue: string, lang?: string) {
    const trimmedKey = trim(key);
    if (lang) {
      // Only add new translation if id doesn't exist yet
      if (!this._translations[lang][trimmedKey]) {
        this._translations[lang][trimmedKey] = initialValue;
      }
    } else {
      for (const language of Object.keys(this._translations)) {
        // Only add new translation if id doesn't exist yet
        if (!this._translations[language][trimmedKey]) {
          this._translations[language][trimmedKey] = initialValue;
        }
      }
    }
  }

  public updateTranslation(language: string, key: string, value: string) {
    this._translations[language][key] = value;
  }

  public updateTranslations(language: string, translations: IVeoTranslationCollection) {
    this._translations[language] = translations;
  }

  public changeTranslationKey(oldKey: string, newKey: string) {
    // Make sure new key is always trimmed
    newKey = trim(newKey);

    for (const language of Object.keys(this._translations)) {      
      // Update exact key (for example scnario_threat)
      this._translations[language][newKey] = this._translations[language][oldKey];
      delete this._translations[language][oldKey];

      // Update child translations (for example scenario_threat_type)
      this._translations[language] = Object.fromEntries(Object.entries(this._translations[language]).map(([translationKey, value]) => {
        if(translationKey.includes(`${oldKey}_`)) {
          translationKey = translationKey.replace(`${oldKey}_`, `${newKey}_`);
        }
        return [translationKey, value];
      }));
    }
  }

  public removeTranslation(key: string, language?: string) {
    if (language) {
      delete this._translations[language][key];
    } else {
      for (const language of Object.keys(this._translations)) {
        delete this._translations[language][key];
      }
    }
  }

  public removeTranslationsContainingKey(key: string) {
    for (const language of Object.keys(this._translations)) {
      for (const translationKey of Object.keys(this._translations[language])) {
        // we use the lower dash to make sure that we don't remove language keys for an aspect that has the key as a substring
        if (translationKey.includes(`${key}_`)) {
          delete this._translations[language][translationKey];
        }
      }
    }
  }

  public removeLanguage(language: string) {
    delete this._translations[language];
  }

  public updateDomain(domainId: string, subTypes: IVeoOSHDomains['domain']) {
    this._domains[domainId] = subTypes;
  }

  public getCustomLinks(): IVeoOSHCustomLink[] {
    return this._customLinks;
  }

  public getCustomLink(name: string): IVeoOSHCustomLink | undefined {
    return this._customLinks.find((item) => item.title === name);
  }

  public getBasicProperties(): IVeoOSHCustomProperty[] {
    return this._basicProperties;
  }

  public getLanguages(): string[] {
    return Object.keys(this._translations);
  }

  public getTranslations(language: string): IVeoTranslationCollection {
    return this._translations[language];
  }

  public getTranslation(language: string, key: string): string | undefined {
    return this._translations[language]?.[key];
  }

  public getAllTranslations(): IVeoObjectSchemaTranslations {
    return this._translations;
  }

  public getSubTypes(domainId: string): IVeoOSHDomains['domain'] {
    return this._domains[domainId] || [];
  }

  public toSchema(): IVeoObjectSchema {
    const dummy: IVeoObjectSchema = this.generateSchema();

    for (const aspect of this._customAspects) {
      this.addAspectToSchema(dummy, aspect);
    }

    for (const link of this._customLinks) {
      this.addLinkToSchema(dummy, link);
    }

    for (const domainId of Object.keys(this._domains)) {
      this.addDomainToSchema(dummy, domainId, this._domains[domainId]);
    }

    if (Object.keys(this._translations).length > 0) {
      dummy.properties.translations = this._translations;
    }

    return dummy;
  }

  public validate(): VeoSchemaValidatorValidationResult {
    const validator = new ObjectSchemaValidator();
    return validator.validate(this.toSchema());
  }

  private static addPrefixToEnum(items: string[], prefix: string) {
    return items.map((item: string) => `${prefix}_${item}`);
  }

  public static generateLinkSchema(link: IVeoOSHCustomLink): IVeoObjectSchemaCustomLink {
    const schemaLink: IVeoObjectSchemaCustomLink = {
      items: {
        additionalProperties: false,
        properties: {
          attributes: {
            additionalProperties: false,
            properties: {},
            type: 'object'
          },
          domains: {
            description: 'The ids of elements of the type domain.',
            items: {
              properties: {
                displayName: {
                  description: 'A friendly human readable title of the referenced domain.',
                  type: 'string'
                },
                targetUri: {
                  description: 'The resource URL of the referenced domain.',
                  type: 'string'
                }
              },
              required: ['targetUri'],
              type: 'object'
            },
            title: 'The list of domains in which this element is present.',
            type: 'array',
            uniqueItems: true
          },
          id: {
            format: 'regex',
            pattern: '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}',
            title: 'The UUID to identify the element',
            type: 'string'
          },
          references: {
            items: {
              properties: {
                displayName: {
                  description: 'A friendly human readable title of the referenced object.',
                  type: 'string'
                },
                targetUri: {
                  description: 'The resource URL of the referenced object.',
                  type: 'string'
                }
              },
              type: 'object',
              required: ['targetUri']
            },
            type: 'array'
          },
          target: {
            properties: {
              subType: {
                enum: [link.subType]
              },
              targetUri: {
                title: 'The id of the target object.',
                type: 'string'
              },
              type: {
                enum: [link.targetType]
              }
            },
            required: ['targetUri'],
            type: 'object'
          }
        },
        required: ['target'],
        type: 'object'
      },
      type: 'array'
    };

    // Add optional properties
    if (link.subType) {
      schemaLink.items.properties.target.properties.subType = {
        enum: [link.subType]
      };
    }

    for (const attribute of link.attributes) {
      // @ts-ignore Some type error, but as the editors will get reworked anyways ¯\_(ツ)_/¯
      const dummy: IVeoObjectSchemaProperty = { ...attribute };
      dummy.title = dummy.description;
      delete dummy.prefix;
      delete dummy.description;

      // @ts-ignore We cast attribute to IVeoObjectSchemaProperty a couple lines before,
      // however there is still some data in there which is not defined in IVeoObjectSchemaProperty
      if (dummy.type === 'enum') {
        dummy.enum = this.addPrefixToEnum(dummy.enum, `${attribute.prefix}${attribute.title}`);
        delete dummy.type;
        if (dummy.multiple) {
          dummy.type = 'array';
          dummy.items = { enum: dummy.enum };
          delete dummy.enum;
        } else {
          delete dummy.items;
        }
      } else {
        delete dummy.enum;
      }

      delete dummy.multiple;

      schemaLink.items.properties.attributes.properties[`${attribute.prefix}${attribute.title}`] = dummy;
    }

    return schemaLink;
  }

  public static generateAspectSchema(aspect: IVeoOSHCustomAspect): IVeoObjectSchemaCustomAspect {
    const schemaAspect = {
      additionalProperties: false,
      properties: {
      } as Record<string, any>,
      type: 'object'
    };

    for (const attribute of aspect.attributes) {
      // @ts-ignore Some type error, but as the editors will get reworked anyways ¯\_(ツ)_/¯
      const dummy: IVeoObjectSchemaProperty = { ...attribute };
      dummy.title = dummy.description;
      delete dummy.prefix;
      delete dummy.description;

      // @ts-ignore We cast attribute to IVeoObjectSchemaProperty a couple lines before,
      // however there is still some data in there which is not defined in IVeoObjectSchemaProperty
      if (dummy.type === 'enum') {
        dummy.enum = this.addPrefixToEnum(dummy.enum, `${attribute.prefix}${attribute.title}`);
        delete dummy.type;
        if (dummy.multiple) {
          dummy.type = 'array';
          dummy.items = { enum: dummy.enum };
          delete dummy.enum;
        } else {
          delete dummy.items;
        }
      } else {
        delete dummy.enum;
      }

      delete dummy.multiple;

      // #168 Description is no longer used,as now all attributes are internationalized
      delete dummy.title;

      schemaAspect.properties[`${attribute.prefix}${attribute.title}`] = dummy;
    }

    // @ts-ignore Some type error, but as the editors will get reworked anyways ¯\_(ツ)_/¯
    return schemaAspect;
  }

  public static generateDomain(domain: IVeoOSHDomains['domain']): any {
    const dummy = {
      $schema: 'https://json-schema.org/draft/2019-09/schema',
      type: 'object',
      properties: {
        status: {
          type: 'string',
          minLength: 1,
          maxLength: 255
        },
        subType: {
          type: 'string',
          minLength: 1,
          maxLength: 255,
          enum: [] as string[]
        }
      },
      dependentRequired: {
        subType: ['status'],
        status: ['subType']
      },
      allOf: [] as any[]
    };

    dummy.properties.subType.enum = domain.map((subType) => subType.subType);

    for (const subType of domain) {
      dummy.allOf.push({
        if: {
          properties: {
            subType: {
              const: subType.subType
            }
          }
        },
        then: {
          properties: {
            status: {
              enum: subType.status
            }
          }
        }
      });
    }

    return dummy;
  }

  private loadObjectSchema(objectSchema: IVeoObjectSchema) {
    this._title = objectSchema.title;
    this._title = objectSchema.title;
    this._description = objectSchema.description;

    for (const key in objectSchema.properties) {
      switch (key) {
        case this._options.customAspectsKey:
          this.loadCustomAspects(objectSchema.properties[key]);
          break;
        case this._options.customLinksKey:
          this.loadCustomLinks(objectSchema.properties[key]);
          break;
        case this._options.translationsKey:
          this.loadTranslations(objectSchema.properties[key]);
          break;
        case this._options.domainsKey:
          this.loadDomains(objectSchema.properties[key]);
          break;
        default:
          this.loadBasicProperties(objectSchema.properties, key);
      }
    }
  }

  private removePrefixFromEnum(items: string[], prefix: string) {
    return items.map((item: string) => item.split(`${prefix}_`)[1]);
  }

  private loadCustomAspects(aspects: IVeoObjectSchema['properties']['customAspects']) {
    for (const aspectName in aspects.properties) {
      const aspect = aspects.properties[aspectName] as IVeoObjectSchemaCustomAspect;
      const dummy: any = {};
      dummy.title = this.cleanCustomObjectName(aspectName);
      dummy.attributes = [];
      dummy.prefix = `${this._title}_`;

      const attributes: Record<string, any> = this._options.domainSpecificObjectSchema
        ? aspect.properties
        : aspect.properties.attributes.properties;

      for (const attributeName in attributes) {
        const attribute = attributes[attributeName];

        const toPush = {
          ...attribute,
          title: this.cleanAttributeName(attributeName, dummy.title),
          type: this.getAttributeType(attribute),
          prefix: `${dummy.prefix}${dummy.title}_`
        } as any;

        // Multi selects are stored as arrays, so we have to manually transform them to an enum.
        if (toPush.type === 'array' && toPush.items.enum) {
          toPush.enum = toPush.items.enum;
          toPush.multiple = true;
          toPush.type = 'enum';
        }

        if (toPush.enum) {
          toPush.enum = this.removePrefixFromEnum(toPush.enum, `${toPush.prefix}${toPush.title}`);
        }

        dummy.attributes.push(toPush);
      }
      this._customAspects.push(dummy);
    }
  }

  private loadCustomLinks(links: IVeoObjectSchema['properties']['links']) {
    for (const linkName in links.properties) {
      const link = links.properties[linkName] as IVeoObjectSchemaCustomLink;
      const dummy: any = {};
      dummy.title = this.cleanCustomObjectName(linkName);
      dummy.attributes = [];
      dummy.prefix = `${this._title}_`;
      dummy.targetType = link.items.properties.target.properties.type.enum[0];
      dummy.subType = link.items.properties.target.properties.subType?.enum[0];

      for (const attributeName in link.items.properties.attributes.properties) {
        const attribute = link.items.properties.attributes.properties[attributeName];

        const toPush = {
          ...attribute,
          title: this.cleanAttributeName(attributeName, dummy.title),
          type: this.getAttributeType(attribute),
          prefix: `${dummy.prefix}${dummy.title}_`
        } as any;

        // Multi selects are stored as arrays, os we have to manually transform them to an enum.
        if (toPush.type === 'array' && toPush.items.enum) {
          toPush.enum = toPush.items.enum;
          toPush.multiple = true;
          toPush.type = 'enum';
        }

        if (toPush.enum) {
          toPush.enum = this.removePrefixFromEnum(toPush.enum, `${toPush.prefix}${toPush.title}`);
        }

        dummy.attributes.push(toPush);
      }
      this._customLinks.push(dummy);
    }
  }

  private loadBasicProperties(schema: IVeoObjectSchema['properties'], key: string) {
    const property = schema[key] as IVeoObjectSchemaProperty;
    this._basicProperties.push({ title: key, description: property.description || '', type: this.getAttributeType(property), prefix: '' });
  }

  private loadDomains(schema: IVeoObjectSchemaProperty) {
    this._domains = {};

    const domains = Object.keys(schema.properties);
    for (const domain of domains) {
      this._domains[domain] = Object.values(
        schema.allOf?.map((mapping: any) => ({
          subType: mapping.if.properties.subType.const,
          status: mapping.then.properties.status.enum
        }))
      );
    }
  }

  private loadTranslations(translations: IVeoObjectSchemaTranslations) {
    this._translations = translations;
  }

  private getAttributeType(attribute: IVeoObjectSchemaProperty) {
    return attribute.enum ? 'enum' : attribute.type ? attribute.type : 'unknown';
  }

  private cleanCustomObjectName(customObjectName: string) {
    return customObjectName.replace(`${this._title}_`, '');
  }

  private cleanAttributeName(attributeName: string, customObjectName: string) {
    return attributeName.replace(`${this._title}_`, '').replace(`${customObjectName}_`, '');
  }

  private updateAspectAttributePrefixes(aspectIndex: number) {
    for (const attributeIndex in this._customAspects[aspectIndex].attributes) {
      this._customAspects[aspectIndex].attributes[attributeIndex].prefix = `${this._customAspects[aspectIndex].prefix}${this._customAspects[aspectIndex].title}_`;
    }
  }

  private updateLinkAttributePrefixes(linkIndex: number) {
    for (const attributeIndex in this._customLinks[linkIndex].attributes) {
      this._customLinks[linkIndex].attributes[attributeIndex].prefix = `${this._customLinks[linkIndex].prefix}${this._customLinks[linkIndex].title}_`;
    }
  }

  private updateSchemaPrefixes() {
    for (const aspectIndex in this._customAspects) {
      this._customAspects[aspectIndex].prefix = `${this._title}_`;
      this.updateAspectAttributePrefixes(aspectIndex as unknown as number);
    }

    for (const linkIndex in this._customLinks) {
      this._customLinks[linkIndex].prefix = `${this._title}_`;
      this.updateLinkAttributePrefixes(linkIndex as unknown as number);
    }
  }

  /**
   * Schema generation
   *
   * All following functions are only used for schema generation and should only be called by the toSchema() method.
   */
  private generateSchema(): IVeoObjectSchema {
    this._schema.title = this._title;
    this._schema.description = this._description;
    this._schema.properties.customAspects.properties = {};
    this._schema.properties.links.properties = {};
    return this._schema;
  }

  private addAspectToSchema(schema: IVeoObjectSchema, aspect: IVeoOSHCustomAspect) {
    schema.properties.customAspects.properties[`${aspect.prefix}${aspect.title}`] = ObjectSchemaHelper.generateAspectSchema(aspect);
  }

  private addLinkToSchema(schema: IVeoObjectSchema, link: IVeoOSHCustomLink) {
    schema.properties.links.properties[`${link.prefix}${link.title}`] = ObjectSchemaHelper.generateLinkSchema(link);
  }

  private addDomainToSchema(schema: IVeoObjectSchema, domainId: string, domain: IVeoOSHDomains['domain']) {
    schema.properties.domains.properties[domainId] = ObjectSchemaHelper.generateDomain(domain);
  }

  private getDefaultSchema(domainId: string): any {
    return {
      $schema: 'https://json-schema.org/draft/2019-09/schema',
      $id: 'new-schema',
      type: 'object',
      properties: {
        _self: {
          type: 'string',
          description: 'A valid reference to this resource.',
          readOnly: true,
          format: 'uri'
        },
        abbreviation: {
          type: 'string',
          description: 'The abbreviation for the Element.',
          maxLength: 255
        },
        createdAt: {
          type: 'string',
          description: 'A timestamp acc. to RFC 3339 specifying when this entity was created.',
          readOnly: true
        },
        createdBy: {
          type: 'string',
          description: 'The username of the user who created this object.',
          readOnly: true
        },
        customAspects: {
          type: 'object',
          title: 'CustomAspect',
          description: "Groups of customizable attributes - see '/schemas'",
          properties: {}
        },
        description: {
          type: 'string',
          description: 'The description for the Element.',
          maxLength: 65535
        },
        designator: {
          type: 'string',
          description: 'Compact human-readable identifier that is unique within the client.',
          readOnly: true
        },
        domains: {
          type: 'object',
          description: "Details about this element's association with domains. Domain ID is key, association object is value.",
          properties: {
            [domainId]: {
              $schema: 'https://json-schema.org/draft/2019-09/schema',
              type: 'object',
              properties: {
                subType: {
                  type: 'string',
                  enum: []
                },
                status: {
                  type: 'string'
                }
              },
              dependentRequired: {
                subType: ['status'],
                status: ['subType']
              },
              allOf: []
            }
          },
          additionalProperties: false
        },
        id: {
          type: 'string',
          description: 'ID must be a valid UUID string following RFC 4122.',
          format: 'uuid'
        },
        links: {
          type: 'object',
          title: 'CustomLink',
          description: 'Custom relations which do not affect the behavior.',
          properties: {}
        },
        name: {
          type: 'string',
          description: 'The name for the Element.',
          maxLength: 255
        },
        owner: {
          type: 'object',
          properties: {
            displayName: {
              type: 'string',
              description: 'A friendly human readable title of the referenced unit.',
              readOnly: true
            },
            resourcesUri: {
              type: 'string',
              readOnly: true
            },
            searchesUri: {
              type: 'string',
              readOnly: true
            },
            targetUri: {
              type: 'string',
              description: 'The resource URL of the referenced unit.',
              format: 'uri'
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
                description: 'A friendly human readable title of the referenced entity.',
                readOnly: true
              },
              resourcesUri: {
                type: 'string',
                readOnly: true
              },
              searchesUri: {
                type: 'string',
                readOnly: true
              },
              targetUri: {
                type: 'string',
                description: 'The resource URL of the referenced entity.',
                format: 'uri'
              }
            },
            required: ['targetUri'],
            description: "A reference to an entity's part"
          }
        },
        type: {
          type: 'string',
          description: 'Entity type identifier',
          readOnly: true
        },
        updatedAt: {
          type: 'string',
          description: 'A timestamp acc. to RFC 3339 specifying when this entity was created.',
          readOnly: true
        },
        updatedBy: {
          type: 'string',
          description: 'The username of the user who last updated this object.',
          readOnly: true
        }
      },
      required: ['_self', 'designator', 'name', 'owner'],
      title: '',
      description: ''
    };
  }
}

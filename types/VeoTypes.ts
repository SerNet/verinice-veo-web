/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Jessica Lühnen
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
import { JSONSchema7TypeName } from 'json-schema';
import { UISchemaElement } from './UISchema';
import { IBaseObject } from '~/lib/utils';
import { Mode } from '~/components/forms/utils';

export type IVeoFormSchemaContentType = 'Layout' | 'Control' | 'Label' | string;

/**
 * 1. Types of user generated data
 */
export interface IVeoDeploymentInformation {
  build: {
    artifact: string;
    ci: {
      jobname: string;
      buildnumber: string;
    };
    group: string;
    name: string;
    time: string;
    version: string;
  };
  git: {
    branch: string;
    commit: {
      id: string;
      time: string;
    };
  };
}

export interface IVeoBaseObject {
  id: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface IVeoLink {
  displayName?: string;
  resourcesUri?: string;
  targetUri: string;
  searchesUri?: string;
}

export interface IVeoRiskValue {
  abbreviation: string;
  description: string;
  htmlColor: string;
  name: string;
  ordinalValue: number;
  symbolicRisk: string;
}

export interface IVeoRiskPotentialImpact {
  abbreviation: string;
  description: string;
  htmlColor: string;
  name: string;
  ordinalValue: string;
  valueMatrix: IVeoRiskValue[][];
}

export interface IVeoRiskCategory {
  abbreviation: string;
  description: string;
  id: string;
  name: string;
  potentialImpacts: IVeoRiskPotentialImpact;
  valueMatrix: IVeoRiskValue[][];
}

export interface IVeoRiskProbabilityLevel {
  name: string;
  abbreviation: string;
  description: string;
  htmlColor: string;
  ordinalValue: number;
}

export interface IVeoRiskProbability {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  levels: IVeoRiskProbabilityLevel[];
}

export interface IVeoRiskImplementationState {
  name: string;
  abbreviation: string;
  description: string;
  htmlColor: string;
  ordinalValue: number;
}

export interface IVeoDomain extends IVeoBaseObject {
  name: string;
  abbreviation: string;
  description: string;
  catalogs: any[];
  riskDefinitions: {
    [key: string]: {
      id: string;
      probability: IVeoRiskProbability;
      implementationStateDefinition: {
        id: string;
        name: string;
        abbreviation: string;
        description: string;
        levels: IVeoRiskImplementationState[];
      };
      categories: IVeoRiskCategory[];
      riskValues: IVeoRiskValue[];
      riskMethod: {
        impactMethod: string;
        description: string;
      };
    };
  };
}

// At the moment, we only use strings in the frontend for custom attributes.
// Later on, there are plans to use numbers and booleans as well.
export interface IVeoCustomAttributes {
  [key: string]: string;
}

interface IVeoCustomObject {
  applicableTo: IVeoLink[];
  attributes: IVeoCustomAttributes;
  domains: IVeoLink[];
}

export interface IVeoCustomLink extends IVeoCustomObject {
  name: string;
  target: IVeoLink;
}

export interface IVeoCustomAspect extends IVeoCustomObject {}

export interface IVeoCustomLinks {
  [key: string]: IVeoCustomLink;
}

export interface IVeoCustomAspects {
  [key: string]: IVeoCustomAspect;
}

export interface IVeoTranslationCollection {
  [key: string]: string;
}

export interface IVeoReactiveFormAction {
  attributeName: string;
  handler: (newValue: string, newObject: IBaseObject, oldObject: IBaseObject) => void;
}

export interface IVeoFormsAdditionalContext {
  [pointer: string]: {
    objectSchema?: IBaseObject;
    formSchema?: IBaseObject;
  };
}

export interface IVeoFormsControlProps {
  customTranslation: IVeoTranslationCollection;
  disabled: boolean;
  elements: UISchemaElement[] | undefined;
  generalTranslation: IVeoTranslationCollection;
  name: string;
  objectCreationDisabled: boolean;
  options: {
    label: any;
    [option: string]: any;
  };
  schema: IBaseObject;
  validation: { objectSchema: { errorMsg: any } };
  value: any;
  visible: boolean;
}

export interface IVeoPaginatedResponseMeta {
  totalItemCount: number;
  pageCount: number;
  page: number;
}
export interface IVeoPaginatedResponse<T> extends IVeoPaginatedResponseMeta {
  items: T;
}

export interface IVeoPaginationOptions {
  displayName?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface IVeoObjectSchemaProperty {
  type?: JSONSchema7TypeName;
  title?: string;
  description?: string;
  pattern?: string;
  allOf?: {
    if: {
      properties: IBaseObject;
    };
    then: {
      properties: IBaseObject;
    };
  }[];
  [key: string]: any;
}

export interface IVeoObjectSchemaObject extends IVeoObjectSchemaProperty {
  type: 'object';
  properties: {
    [key: string]: IVeoObjectSchemaProperty;
  };
}

export interface IVeoObjectSchemaPatternObject extends IVeoObjectSchemaProperty {
  type: 'object';
  properties: {
    [key: string]: IVeoObjectSchemaProperty;
  };
}

export interface IVeoObjectSchemaArray extends IVeoObjectSchemaProperty {
  type: 'array';
  items: any;
}

export interface IVeoObjectSchemaTranslations {
  [key: string]: IVeoTranslationCollection;
}

export interface IVeoObjectSchemaCustomAspect {
  type: 'object';
  properties: {
    id: IVeoObjectSchemaProperty;
    applicableTo: IVeoObjectSchemaArray;
    domains: IVeoObjectSchemaArray;
    references: IVeoObjectSchemaArray;
    attributes: IVeoObjectSchemaObject;
  };
  additionalProperties: boolean;
  required: string[];
}

export interface IVeoObjectSchemaCustomLink {
  type: 'array';
  items: {
    type: 'object';
    properties: {
      attributes: IVeoObjectSchemaObject;
      domains: IVeoObjectSchemaArray;
      id: IVeoObjectSchemaProperty;
      references: IVeoObjectSchemaArray;
      target: IVeoObjectSchemaObject;
    };
    additionalProperties: boolean;
    required: string[];
  };
}

export interface IVeoObjectSchemaCustomObjects {
  type: JSONSchema7TypeName;
  title: string;
  description: string;
  properties: {
    [key: string]: IVeoObjectSchemaCustomAspect | IVeoObjectSchemaCustomLink;
  };
}

export interface IVeoObjectSchema {
  $schema: string;
  type: JSONSchema7TypeName;
  properties: {
    abbreviation: IVeoObjectSchemaProperty;
    createdAt: IVeoObjectSchemaProperty;
    createdBy: IVeoObjectSchemaProperty;
    customAspects: IVeoObjectSchemaCustomObjects;
    description: IVeoObjectSchemaProperty;
    domains: IVeoObjectSchemaPatternObject;
    id: IVeoObjectSchemaProperty;
    links: IVeoObjectSchemaCustomObjects;
    name: IVeoObjectSchemaProperty;
    owner: IVeoObjectSchemaObject;
    parts: IVeoObjectSchemaArray;
    updatedAt: IVeoObjectSchemaProperty;
    updatedBy: IVeoObjectSchemaProperty;
    translations?: IVeoObjectSchemaTranslations;
  };
  required: string[];
  title: string;
  description: string;
}

export interface IVeoAPIMessage {
  success: boolean;
  resourceId: string;
  message: string;
}

export interface IVeoUnit extends IVeoBaseObject {
  name: string;
  description: string;
  domains: IVeoLink[];
  units: IVeoUnit[];
}

export interface IVeoUnitIncarnations {
  parameters: {
    item: IVeoLink;
    references: {
      referencedElement: IVeoLink;
      [key: string]: any;
      referenceType: string;
    }[];
  }[];
}

export interface IVeoCatalog extends IVeoBaseObject {
  name: string;
  domainTemplate: IVeoLink;
  catalogItems: IVeoLink[];
}

export interface IVeoCatalogItem extends IVeoBaseObject {
  id: string;
  description: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  catalog: IVeoLink;
  tailoringReferences: {
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    referenceType: string;
    catalogItem: IVeoLink;
    attributes: IBaseObject;
    type: string;
    id: string;
  }[];
  namespace: string;
  element: IVeoLink;
}

export interface IVeoEntityDomain {
  [key: string]: {
    status: string;
    subType: string;
  };
}

export interface IVeoEntity extends IVeoBaseObject {
  name: string;
  abbreviation?: string;
  designator: string;
  displayName: string;
  description?: string;
  domains: IVeoEntityDomain;
  owner: IVeoLink;
  links: IVeoCustomLinks;
  customAspects: IVeoCustomAspects;
  members: IVeoLink[]; // Only contains items if entity is of type scope
  parts: IVeoLink[]; // Only contains items if entity is NOT of type scope
  descriptionShort?: string; // Frontend only attribute used in VeoObjectList.vue
  type: string;
  _self: string;
}

export interface IVeoRisk {
  scenario: IVeoLink;
  mitigation?: IVeoLink;
  process?: IVeoLink;
  domains: {
    [domainId: string]: {
      reference: IVeoLink;
    };
  };
}

export interface IVeoTranslations {
  lang: {
    [key: string]: IVeoTranslationCollection;
  };
}

export interface IVeoFormSchemaMeta {
  modelType: string;
  subType: string;
  name: { [key: string]: string };
  id?: string;
  domainId?: string;
  sorting: string | null;
}

export interface IVeoFormSchemaItemOptions {
  label?: string;
  format?: string;
  direction?: string;
  class?: string;
}

export interface IVeoFormSchemaItemRule {
  effect: 'SHOW' | 'HIDE';
  condition: {
    scope: string;
    schema: { enum: (string | boolean | number)[] };
  };
}

export interface IVeoFormSchemaItem {
  type: IVeoFormSchemaContentType;
  scope?: string;
  text?: string;
  options: IVeoFormSchemaItemOptions;
  elements?: IVeoFormSchemaItem[];
  rule?: IVeoFormSchemaItemRule;
}

export interface IVeoFormSchemaTranslationCollection {
  [key: string]: IVeoTranslationCollection;
}

export interface IVeoFormSchemaCustomTranslationEvent {
  [key: string]: string | undefined;
}

export interface IVeoFormSchemaItemUpdateEvent {
  formSchemaPointer: string;
  data: IVeoFormSchemaItem;
}

export interface IVeoFormSchemaItemDeleteEvent {
  formSchemaPointer: string;
}

export interface IVeoFormSchema extends IVeoFormSchemaMeta {
  content: IVeoFormSchemaItem;
  translation: IVeoFormSchemaTranslationCollection;
}

export interface IVeoReportMeta {
  name: {
    [key: string]: string;
  };
  description: {
    [key: string]: string;
  };
  outputTypes: string[];
  multipleTargetsSupported: boolean;
  targetTypes: {
    modelType: string;
    subTypes?: string[] | null;
  }[];
}

export interface IVeoReportsMeta {
  [key: string]: IVeoReportMeta;
}

export interface IVeoCreateReportData {
  outputType: string;
  targets: {
    type: string;
    id: string;
  }[];
}

export interface IVeoObjectHistoryEntry {
  author: string;
  content: IVeoEntity;
  time: string;
  type: string;
  changeNumber: number;
  uri: string;
}

export enum VeoAlertType {
  ERROR,
  INFO,
  SUCCESS
}

export interface IVeoGlobalAlertParams {
  buttonText?: String; // If not set defaults to "Okay" in VeoGlobalAlert of types "Info & Error"
  eventCallbacks?: { [event: string]: CallableFunction };
  [key: string]: any;
}

export interface IVeoGlobalAlert {
  type: VeoAlertType;
  title?: string; // Not required in snackbars (Success message)
  text: string;
  params?: IVeoGlobalAlertParams; // Allows the user to specify certain aspects of the alert
  alertKey?: number; // Used to display one alert after another (only one should be displayed at once) and to programmatically remove an alert
}

export interface IVeoFormSchemaGeneratorOptions {
  excludedProperties?: string[];
  groupedNamespaces?: { namespace: string; label?: string }[];
  generateControlFunction: (pointer: string, schema: IBaseObject, mode: Mode) => any;
  generateGroupFunction: (children: any[], label?: string) => any;
}

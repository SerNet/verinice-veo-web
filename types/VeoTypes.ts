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
import { MaybeRef } from '@vueuse/core';
import { JSONSchema7TypeName } from 'json-schema';

import { UISchemaElement } from './UISchema';
import { Mode } from '~/components/dynamic-form/util';
import { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import { IAlertButton } from '~/components/base/Alert.vue';

export type IVeoFormSchemaContentType = 'Layout' | 'Control' | 'Label' | string;

/**
 * 1. Types of user generated data
 */
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
  name?: string;
  id?: string;
}

export interface IVeoRiskDefinitionItemTranslations {
  [lang: string]: {
    name: string;
    abbreviation: string;
    description: string;
  };
}

export interface IVeoRiskValueLevel {
  htmlColor: string;
  translations: IVeoRiskDefinitionItemTranslations;
  ordinalValue: number;
  symbolicRisk: string;
}

export interface IVeoRiskPotentialImpact {
  htmlColor: string;
  translations: IVeoRiskDefinitionItemTranslations;
  ordinalValue: string;
  valueMatrix?: IVeoRiskValueLevel[][];
}

export interface IVeoRiskCategory {
  id: string;
  translations: IVeoRiskDefinitionItemTranslations;
  potentialImpacts: IVeoRiskPotentialImpact[];
  valueMatrix: IVeoRiskValueLevel[][];
}

export interface IVeoRiskProbabilityLevel {
  htmlColor: string;
  ordinalValue: number;
  translations: IVeoRiskDefinitionItemTranslations;
}

export interface IVeoRiskProbability {
  id: string;
  translations: IVeoRiskDefinitionItemTranslations;
  levels: IVeoRiskProbabilityLevel[];
}

export interface IVeoRiskImplementationState {
  translations: IVeoRiskDefinitionItemTranslations;
  htmlColor: string;
  ordinalValue: number;
}

export interface IVeoDomainRiskDefinition {
  id: string;
  probability: IVeoRiskProbability;
  implementationStateDefinition: {
    id: string;
    translations: IVeoRiskDefinitionItemTranslations;
    levels: IVeoRiskImplementationState[];
  };
  categories: IVeoRiskCategory[];
  riskValues: IVeoRiskValueLevel[];
  riskMethod: {
    impactMethod: string;
    translations: {
      [lang: string]: {
        description: string;
      };
    };
  };
}

export type VeoRiskTreatment =
  | 'RISK_TREATMENT_NONE'
  | 'RISK_TREATMENT_AVOIDANCE'
  | 'RISK_TREATMENT_ACCEPTANCE'
  | 'RISK_TREATMENT_TRANSFER'
  | 'RISK_TREATMENT_REDUCTION';

export interface IVeoPiaMandatoryRule {
  description: {
    [key: string]: string;
  };
  conditions: {
    inputMatcher: {
      type: string;
    };
    inputProvider: {
      type: string;
    };
  }[];
  output?: boolean;
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
  attributes: Record<string, any>;
  domains: any;
  target: IVeoLink;
}

export type IVeoCustomAspect = IVeoCustomObject;

export interface IVeoCustomLinks {
  [key: string]: IVeoCustomLink[];
}

export interface IVeoCustomAspects {
  [key: string]: IVeoCustomAspect;
}

export interface IVeoTranslationCollection {
  [key: string]: string;
}

export interface IVeoReactiveFormAction {
  attributeName: string;
  handler: (
    newValue: string,
    newObject: Record<string, any>,
    oldObject: Record<string, any>
  ) => void;
}

export interface IVeoFormsAdditionalContext {
  [pointer: string]: {
    objectSchema?: Record<string, any>;
    formSchema?: Record<string, any>;
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
  schema: Record<string, any>;
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
      properties: Record<string, any>;
    };
    then: {
      properties: Record<string, any>;
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

export interface IVeoObjectSchemaPatternObject
  extends IVeoObjectSchemaProperty {
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
  allOf?: {
    if: {
      properties: Record<string, any>;
    };
    then: {
      properties: Record<string, any>;
    };
  }[];
  properties: {
    abbreviation: IVeoObjectSchemaProperty;
    createdAt: IVeoObjectSchemaProperty;
    createdBy: IVeoObjectSchemaProperty;
    customAspects: IVeoObjectSchemaCustomObjects;
    description: IVeoObjectSchemaProperty;
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

export interface IVeoDecisionResults {
  [decision: string]: {
    value?: boolean;
    decisiveRule?: number;
    matchingRules?: number[];
    agreeingRules?: number[];
  };
}

export interface IVeoInspectionResult {
  description: {
    [lang: string]: string;
  };
  severity: string;
  suggestions: {
    type: 'addPart' | string;
    partSubType?: string;
    [key: string]: any;
  }[];
}

export interface IVeoDecisionEvaluation {
  decisionResults: IVeoDecisionResults;
  inspectionFindings: IVeoInspectionResult[];
}

export interface IVeoEntityDomain {
  [key: string]: {
    status?: string;
    subType?: string;
    riskDefinition?: string;
    decisionResults?: IVeoDecisionResults;
    riskValues?: any;
  };
}

export interface IVeoControlImplementation {
  control: IVeoLink;
}

export interface IVeoEntityLegacy extends IVeoBaseObject {
  name: string;
  abbreviation?: string;
  controlImplementations?: IVeoControlImplementation[];
  designator: string;
  displayName: string;
  description?: string;
  domains: IVeoEntityDomain;
  owner: IVeoLink;
  links: IVeoCustomLinks;
  customAspects: IVeoCustomAspects;
  members: IVeoLink[]; // Only contains values for scopes
  parts: IVeoLink[]; // Only contains values for objects not of type scope
  type: string;
  _self: string;
}

export interface IVeoEntity extends IVeoBaseObject {
  name: string;
  abbreviation?: string;
  controlImplementations?: IVeoControlImplementation[];
  designator: string;
  displayName: string;
  description?: string;
  owner: IVeoLink;
  links: IVeoCustomLinks;
  customAspects: IVeoCustomAspects;
  members: IVeoLink[]; // Only contains values for scopes
  parts: IVeoLink[]; // Only contains values for objects not of type scope
  riskValues: any;
  status: string;
  subType: string;
  type: string;
  _self: string;
}

export interface IVeoRiskValue {
  category: string;
  residualRisk: number;
  userDefinedResidualRisk?: number;
  residualRiskExplanation: string;
  riskTreatments: VeoRiskTreatment[];
  riskTreatmentExplanation: string;
  inherentRisk: number;
  effectiveRisk: number;
}

export interface IVeoRiskDefinition {
  probability: {
    effectiveProbability: number;
    potentialProbability: number;
    specificProbability: number;
    specificProbabilityExplanation: string;
  };
  impactValues: {
    category: string;
    effectiveImpact: number;
    specificImpact: string;
    specificImpactExplanation: string;
    potentialImpact: string;
  }[];
  riskValues: IVeoRiskValue[];
  categories: IVeoRiskCategory[];
}

export interface IVeoRisk {
  _self?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  designator?: string;
  scenario: IVeoLink;
  mitigation?: IVeoLink;
  process?: IVeoLink;
  riskOwner?: IVeoLink;
  domains: {
    [domainId: string]: {
      reference: IVeoLink;
      riskDefinitions: {
        [riskDefinition: string]: IVeoRiskDefinition;
      };
    };
  };
}

export interface IVeoFormSchemaTranslationCollection {
  [key: string]: IVeoTranslationCollection;
}

export interface IVeoFormSchemaItemUpdateEvent {
  formSchemaPointer: string;
  data: IVeoFormSchemaItem;
}

export interface IVeoFormSchemaItemDeleteEvent {
  type: string;
  formSchemaPointer?: string;
  name?: string;
}

export interface IVeoObjectHistoryEntry {
  author: string;
  content: IVeoEntity;
  time: string;
  type: string;
  changeNumber: number;
  uri: string;
  id?: string;
}

export enum VeoAlertType {
  ERROR,
  INFO,
  SUCCESS
}

export interface IVeoGlobalAlertParams {
  defaultButtonText?: string; // If not set defaults to "Okay" in VeoGlobalAlert of types "Info & Error"
  actions?: MaybeRef<IAlertButton[]>;
  [key: string]: any;
}

export interface IVeoGlobalAlert {
  type: VeoAlertType;
  title: string; // Not required in snackbars (Success message)
  text?: string;
  params?: IVeoGlobalAlertParams; // Allows the user to specify certain aspects of the alert
  alertKey?: number; // Used to display one alert after another (only one should be displayed at once) and to programmatically remove an alert
}

export interface IVeoFormSchemaGeneratorOptions {
  excludedProperties?: string[];
  groupedNamespaces?: { namespace: string; label?: string }[];
  generateControlFunction: (
    pointer: string,
    schema: Record<string, any>,
    mode: Mode
  ) => any;
  generateGroupFunction: (children: any[], label?: string) => any;
}

export interface IVeoFormsWidgetDefinition {
  name: string;
  description: {
    [lang: string]: string;
  };
}

export interface IVeoElementTypeDefinition {
  subTypes: {
    [key: string]: any;
  };
  translations: {
    [lang: string]: {
      [key: string]: string;
    };
  };
}

export interface IVeoReport {
  name: Record<string, string>;
  description: Record<string, string>;
  multipleTargetsSupported: boolean;
  outputTypes: string[];
  targetTypes: { modelType: string; subTypes: string[] }[];
}

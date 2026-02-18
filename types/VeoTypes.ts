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
import type { MaybeRef } from 'vue';
import type { JSONSchema7TypeName } from 'json-schema';

import type { IAlertButton } from '~/components/base/Alert.vue';
import type { Mode } from '~/components/dynamic-form/util';
import type { IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import type { UISchemaElement } from './UISchema';

export type IVeoFormSchemaContentType = 'Layout' | 'Control' | 'Label' | string;

/**
 * 1. Types of user generated data
 */
export interface IVeoBaseObject {
  id: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface IVeoLink {
  displayName?: string;
  targetUri: string;
  name?: string;
  abbreviation?: string;
  id?: string;
  designator?: string;
  type?: string;
  subType?: string;
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
  ordinalValue: number;
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
  control_bpInformation_protectionApproach?: string;
  control_bpCompendium_content?: string;
  control_nis2Article_content?: string;
  control_bcmRequirement_content?: string;
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
  handler: (newValue: string, newObject: Record<string, any>, oldObject: Record<string, any>) => void;
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
  page?: number | string;
  size?: number | string;
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
    domains: IVeoObjectSchemaArray;
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
      target: IVeoObjectSchemaObject;
    };
    additionalProperties: boolean;
    required: string[];
  };
}

interface Schema {
  type: JSONSchema7TypeName;
  title: string;
  description: string;
}

interface IVeoObjectSchemaCustomAspects extends Schema {
  properties: {
    [key: string]: IVeoObjectSchemaCustomAspect;
  };
}

interface IVeoObjectSchemaCustomLinks extends Schema {
  properties: {
    [key: string]: IVeoObjectSchemaCustomLink;
  };
}

export interface IVeoDomainSpecificObjectSchema {
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
    description: IVeoObjectSchemaProperty;
    id: IVeoObjectSchemaProperty;
    name: IVeoObjectSchemaProperty;
    owner: IVeoObjectSchemaObject;
    parts: IVeoObjectSchemaArray;
    updatedAt: IVeoObjectSchemaProperty;
    updatedBy: IVeoObjectSchemaProperty;
    translations?: IVeoObjectSchemaTranslations;
    subType: {
      type: 'string';
      enum: string[];
    };
    status: {
      type: 'string';
      enum: string[];
    };
    customAspects: IVeoObjectSchemaCustomAspects;
    links: IVeoObjectSchemaCustomLinks;
    riskValues?: IVeoObjectSchemaProperty;
  };
  required: string[];
  title: string;
  description: string;
}

export interface IVeoObjectSchema {
  $schema: string;
  type: JSONSchema7TypeName;
  properties: {
    abbreviation: IVeoObjectSchemaProperty;
    createdAt: IVeoObjectSchemaProperty;
    createdBy: IVeoObjectSchemaProperty;
    customAspects: IVeoObjectSchemaCustomAspects;
    description: IVeoObjectSchemaProperty;
    domains: IVeoObjectSchemaPatternObject;
    id: IVeoObjectSchemaProperty;
    links: IVeoObjectSchemaCustomLinks;
    name: IVeoObjectSchemaProperty;
    owner: IVeoObjectSchemaObject;
    parts: IVeoObjectSchemaArray;
    updatedAt: IVeoObjectSchemaProperty;
    updatedBy: IVeoObjectSchemaProperty;
    translations?: IVeoObjectSchemaTranslations;
    riskValues?: IVeoObjectSchemaProperty;
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

export interface IVeoUnitIncarnationDescriptions {
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
  description?: string;
  // TODO #3066 find some way to express read-only properties
  owner?: IVeoLink;
  responsible?: IVeoLink;
  implementationStatus?: 'UNKNOWN' | 'YES' | 'NO' | 'PARTIAL' | 'N_A';
  _requirementImplementations?: string;
  customAspects?: IVeoCustomAspects;
  _self?: string;
}

export interface IVeoControlImplementationDefinition {
  customAspects?: {
    [aspectName: string]: {
      attributeDefinitions: {
        [attributeName: string]: {
          type: string;
          allowedValues?: string[];
        };
      };
    };
  };
  translations?: {
    [lang: string]: {
      [key: string]: string;
    };
  };
}

export type RequirementImplementation = {
  origin: IVeoLink;
  control: IVeoLink;
  responsible?: ResponsiblePerson;
  status: string;
  origination: string;
  implementationStatement?: string;
  implementationUntil?: string;
};

export type ResponsiblePerson = IVeoLink;

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

export interface IInOutLink {
  direction: 'OUTBOUND' | 'INBOUND';
  linkType: string;
  linkedElement: IVeoLink;
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
  appliedCatalogItem?: IVeoLink;
  members: IVeoLink[]; // Only contains values for scopes
  parts: IVeoLink[]; // Only contains values for objects not of type scope
  riskDefinition?: string;
  riskValues: any;
  status: string;
  subType: string;
  type: string;
  elementType?: string;
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
  ordinalValue: number;
  translations: Record<string, Record<string, string>>;
}

export interface IVeoRiskDefinition {
  probability: {
    effectiveProbability: number;
    potentialProbability: number;
    specificProbability: number;
    specificProbabilityExplanation: string;
    levels: IVeoRiskProbability[];
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

export enum VeoAlertType {
  ERROR,
  INFO,
  SUCCESS,
  WARNING,
  URGENT
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
  generateControlFunction: (pointer: string, schema: Record<string, any>, mode: Mode) => any;
  generateGroupFunction: (children: any[], label?: string) => any;
}

export interface IVeoSubTypeDefinition {
  sortKey: number;
  statuses: string[];
}

export interface IVeoElementTypeDefinition {
  subTypes: {
    [key: string]: IVeoSubTypeDefinition;
  };
  translations: {
    [lang: string]: {
      [key: string]: string;
    };
  };
  customAspects: IVeoCustomAspects;
  controlImplementationDefinition?: IVeoControlImplementationDefinition;
}

export interface IVeoObjectControlCompendiumEntry {
  control_bpCompendium: {
    control_bpCompendium_content: string;
  };
}

export enum VeoElementTypePlurals {
  scope = 'scopes',
  process = 'processes',
  asset = 'assets',
  person = 'persons',
  incident = 'incidents',
  document = 'documents',
  scenario = 'scenarios',
  control = 'controls'
}

export enum VeoElementTypesSingular {
  scopes = 'scope',
  processes = 'process',
  assets = 'asset',
  persons = 'person',
  incidents = 'incident',
  documents = 'document',
  scenarios = 'scenario',
  controls = 'control'
}

export type VeoSort = {
  key: string;
  order: 'asc' | 'desc';
};

export type VeoLinkItem = {
  id: string;
  name: string;
  type: string;
  abbreviation: string;
  directionIcon: string;
  direction: 'INBOUND' | 'OUTBOUND';
  from: string;
  to: string;
  linkType: string;
  subType: string;
};

export const ELEMENT_DETAILS_CONTEXT = 'elementDetails';
export const RI_CONTROL_VIEW_CONTEXT = 'requirementImplementationControlView';
export const CI_DIALOG_VIEW_CONTEXT = 'controlImplementationDetails';
export const contextKeys = [ELEMENT_DETAILS_CONTEXT, RI_CONTROL_VIEW_CONTEXT, CI_DIALOG_VIEW_CONTEXT];

export const RISK_AFFECTED = ['all', 'scope', 'process', 'asset'] as const;
// Alias for backward compatibility
export const RiContextTypes = RISK_AFFECTED;

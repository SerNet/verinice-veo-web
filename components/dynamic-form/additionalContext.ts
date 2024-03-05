/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
import { JsonPointer } from 'json-ptr';
import { JSONSchema7 } from 'json-schema';
import { cloneDeep } from 'lodash';
import { addConditionalSchemaPropertiesToControlSchema } from './util';
import { IVeoFormsAdditionalContext } from '~/components/dynamic-form/types';
import { IVeoTranslationCollection } from '~/types/VeoTypes';
import { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
import { IVeoFormSchemaMeta } from '~/composables/api/queryDefinitions/forms';

export default {};

function getTranslatedRiskValues({
  domain,
  categoryId,
  language,
  riskDefinitionName
}: {
  domain: IVeoDomain;
  language: string;
  riskDefinitionName: string;
  categoryId: string;
}) {
  const potentialImpacts =
    domain.riskDefinitions[riskDefinitionName]?.categories?.find((category) => category.id === categoryId)
      ?.potentialImpacts || [];

  const translations = potentialImpacts.map(
    (level) => level.translations[language]?.name || Object.values(level.translations)[0].name
  );
  return translations;
}

function enrichRisks({
  domain,
  riskDefinitionName,
  language,
  riskDefinitionCategories,
  t
}: {
  domain: IVeoDomain;
  language: string;
  riskDefinitionName: string;
  riskDefinitionCategories: string[];
  t: any;
}) {
  const riskProperties = [
    { property: 'potentialImpacts', transLateEnumValues: true, disabled: false },
    { property: 'potentialImpactReasons', transLateEnumValues: false, disabled: false },
    { property: 'potentialImpactExplanations', transLateEnumValues: false, disabled: false },
    { property: 'potentialImpactEffectiveReasons', transLateEnumValues: false, disabled: false },
    { property: 'potentialImpactsCalculated', transLateEnumValues: true, disabled: true },
    { property: 'potentialImpactsEffective', transLateEnumValues: true, disabled: true }
  ];

  const toReturn = [];

  for (const riskProperty of riskProperties) {
    for (const protectionGoal of riskDefinitionCategories) {
      toReturn.push([
        `#/properties/riskValues/properties/${riskDefinitionName}/properties/potentialImpacts/properties/${protectionGoal}/properties/${riskProperty.property}`,
        {
          formSchema: {
            enum:
              riskProperty.transLateEnumValues ?
                getTranslatedRiskValues({
                  domain,
                  categoryId: protectionGoal,
                  language,
                  riskDefinitionName
                })
              : undefined,
            disabled: riskProperty.disabled,
            label: t(riskProperty.property)
          }
        }
      ]);
    }
  }
  return Object.fromEntries(toReturn);
}

export const getRiskAdditionalContext = (
  objectType: string,
  domain: IVeoDomain,
  language: string,
  t: any
): IVeoFormsAdditionalContext => {
  // we assume "the one and only" risk definition per domain, so we extract the first and only key available
  const riskDefinitionName = Object.keys(domain.riskDefinitions)[0];
  const riskDefinitionCategories = domain.riskDefinitions[riskDefinitionName].categories.map((category) => category.id);

  switch (objectType) {
    case 'process':
    case 'scope':
    case 'asset':
      return enrichRisks({
        domain,
        riskDefinitionCategories,
        language,
        riskDefinitionName,
        t
      });
    case 'scenario':
      return {
        [`#/properties/riskValues/properties/${riskDefinitionName}/properties/potentialProbability`]: {
          formSchema: {
            enum: (() =>
              (domain.riskDefinitions[riskDefinitionName]?.probability?.levels || []).map(
                (level) => level.translations[language]?.name || Object.values(level.translations)[0].name
              ))()
          }
        }
      };
    case 'control':
      return {
        [`#/properties/riskValues/properties/${riskDefinitionName}/properties/implementationStatus`]: {
          formSchema: {
            enum: (() =>
              (domain.riskDefinitions[riskDefinitionName]?.implementationStateDefinition?.levels || []).map(
                (level) => level.translations[language]?.name || Object.values(level.translations)[0].name
              ))()
          }
        }
      };
    default:
      return {};
  }
};

export const getStatusAdditionalContext = (
  objectData: Record<string, any>,
  objectSchema: JSONSchema7,
  translations: IVeoTranslationCollection
): IVeoFormsAdditionalContext => ({
  [`#/properties/status`]: {
    formSchema: {
      disabled: !objectData?.subType,
      enum: (() => {
        const scope = `#/properties/status`;
        let elementSchema: any = cloneDeep(JsonPointer.get(objectSchema, scope) || {});
        elementSchema = addConditionalSchemaPropertiesToControlSchema(objectSchema, objectData, elementSchema, scope);
        return elementSchema?.enum?.map(
          (status: string) => translations?.[`${objectSchema.title}_${objectData?.subType}_status_${status}`] || status
        );
      })()
    }
  }
});

export const getSubTypeTranslation = (
  objectData: Record<string, any>,
  objectSchema: JSONSchema7,
  language: string,
  formSchemas: IVeoFormSchemaMeta[]
): IVeoFormsAdditionalContext => ({
  [`#/properties/subType`]: {
    formSchema: {
      enum: (() => {
        const scope = `#/properties/subType`;
        let elementSchema: any = cloneDeep(JsonPointer.get(objectSchema, scope) || {});
        elementSchema = addConditionalSchemaPropertiesToControlSchema(objectSchema, objectData, elementSchema, scope);
        return elementSchema?.enum?.map(
          (_subType: string) =>
            (formSchemas as IVeoFormSchemaMeta[]).find((formschema) => formschema.subType === _subType)?.name[language]
        );
      })()
    }
  }
});

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
import { IVeoDomain } from '~~/composables/api/queryDefinitions/domains';

export default {};

export const getRiskAdditionalContext = (objectType: string, domain: IVeoDomain, language: string): IVeoFormsAdditionalContext => {
  switch (objectType) {
    case 'process':
      return {
        [`#/properties/domains/properties/${domain.id}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/C`]: {
          formSchema: {
            enum: (() =>
              (domain.riskDefinitions.DSRA?.categories?.find((category) => category.id === 'C')?.potentialImpacts || []).map(
                (level) => level.translations[language]?.name || Object.values(level.translations)[0].name
              ))()
          }
        },
        [`#/properties/domains/properties/${domain.id}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/I`]: {
          formSchema: {
            enum: (() =>
              (domain.riskDefinitions.DSRA?.categories?.find((category) => category.id === 'I')?.potentialImpacts || []).map(
                (level) => level.translations[language]?.name || Object.values(level.translations)[0].name
              ))()
          }
        },
        [`#/properties/domains/properties/${domain.id}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/A`]: {
          formSchema: {
            enum: (() =>
              (domain.riskDefinitions.DSRA?.categories?.find((category) => category.id === 'A')?.potentialImpacts || []).map(
                (level) => level.translations[language]?.name || Object.values(level.translations)[0].name
              ))()
          }
        },
        [`#/properties/domains/properties/${domain.id}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/R`]: {
          formSchema: {
            enum: (() =>
              (domain.riskDefinitions.DSRA?.categories?.find((category) => category.id === 'R')?.potentialImpacts || []).map(
                (level) => level.translations[language]?.name || Object.values(level.translations)[0].name
              ))()
          }
        }
      };
    case 'scenario':
      return {
        [`#/properties/domains/properties/${domain.id}/properties/riskValues/properties/DSRA/properties/potentialProbability`]: {
          formSchema: {
            enum: (() => (domain.riskDefinitions.DSRA?.probability?.levels || []).map((level) => level.translations[language]?.name || Object.values(level.translations)[0].name))()
          }
        }
      };
    case 'control':
      return {
        [`#/properties/domains/properties/${domain.id}/properties/riskValues/properties/DSRA/properties/implementationStatus`]: {
          formSchema: {
            enum: (() =>
              (domain.riskDefinitions.DSRA?.implementationStateDefinition?.levels || []).map(
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
  translations: IVeoTranslationCollection,
  domainId: string
): IVeoFormsAdditionalContext => ({
  [`#/properties/domains/properties/${domainId}/properties/status`]: {
    formSchema: {
      disabled: !objectData.domains?.[domainId]?.subType,
      enum: (() => {
        const scope = `#/properties/domains/properties/${domainId}/properties/status`;
        let elementSchema: any = cloneDeep(JsonPointer.get(objectSchema, scope) || {});
        elementSchema = addConditionalSchemaPropertiesToControlSchema(objectSchema, objectData, elementSchema, scope);
        return elementSchema?.enum?.map((status: string) => translations?.[`${objectSchema.title}_${objectData.domains?.[domainId]?.subType}_status_${status}`] || status);
      })()
    }
  }
});

/*
 * verinice.veo web
 * Copyright (C) 2023  Jonas Heitmann
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
import { IVeoObjectSchema } from '~/types/VeoTypes';
import { IVeoQueryDefinition, STALE_TIME } from '../utils/query';

export interface IVeoEntityMetaInfo {
  collectionUri: string;
  searchUri: string;
  schemaUri: string;
}

export interface IVeoEntitiesMetaInfo {
  [key: string]: IVeoEntityMetaInfo;
}

export interface IVeoSchemaEndpoints {
  [schemaName: string]: string;
}

export interface IVeoFetchSchemaParameters {
  type: string;
  domainId: string;
}

export default {
  queries: {
    fetchSchemas: {
      primaryQueryKey: 'schemas',
      url: '/api/types',
      // Is of type IVeoEntitiesMetaInfo here, but gets returned as IVeoSchemaEndpoints
      onDataFetched: (result: any) =>
        Object.fromEntries(
          Object.entries(result as IVeoEntitiesMetaInfo).map(([key, value]) => [
            key,
            /([a-z]*){(.+)$/.exec(value.collectionUri)?.[1] || value.collectionUri
          ])
        ),
      queryParameterTransformationFn: () => ({}),
      staticQueryOptions: {
        staleTime: STALE_TIME.INFINITY,
        placeholderData: {}
      }
    } as IVeoQueryDefinition<Record<string, never>, IVeoSchemaEndpoints>,
    fetchSchema: {
      primaryQueryKey: 'schema',
      url: '/api/domains/:domainId/:type/json-schema',
      onDataFetched: (result: any) => {
        const riskAffectedEntities = ['Scope', 'Asset', 'Process'];

        if (riskAffectedEntities.includes(result.title)) {
          // determine the specific anylysis type, e.g. DSRA, GSRA, NISRA
          const [analysisType] = Object.keys(result.properties?.riskValues?.properties);
          // shorten the key for convenience
          const analysisTypeProps = result.properties.riskValues.properties[analysisType].properties;
          // extract the impactTypes, e.g. potentialImpactEffectiveReasons, potentialImpactExplanations, ...
          const impactTypes = Object.keys(analysisTypeProps);
          // extract protection goals, e.g. C, I, A
          const protectionGoals = Object.keys(analysisTypeProps?.potentialImpactEffectiveReasons?.properties || {});

          analysisTypeProps.potentialImpacts.properties = protectionGoals.reduce(
            (previous, protectionGoal) => {
              previous[protectionGoal] = {
                properties: impactTypes.reduce(
                  (protectionGoalObject, impactType) => {
                    protectionGoalObject[impactType] = analysisTypeProps[impactType].properties[protectionGoal];
                    return protectionGoalObject;
                  },
                  {} as Record<string, any>
                )
              };
              return previous;
            },
            {} as Record<string, any>
          );

          result.properties.riskValues.properties[analysisType].properties = {
            potentialImpacts: { properties: analysisTypeProps.potentialImpacts.properties }
          };
        }
        result.title = result.title.toLowerCase();
        return result;
      },
      queryParameterTransformationFn: (queryParameters) => ({
        params: {
          domainId: queryParameters.domainId,
          type: queryParameters.type
        }
      }),
      staticQueryOptions: { staleTime: STALE_TIME.MEDIUM }
    } as IVeoQueryDefinition<IVeoFetchSchemaParameters, IVeoObjectSchema>,
    fetchSchemaLegacy: {
      primaryQueryKey: 'schema',
      url: '/api/schemas/:type',
      onDataFetched: (result: any) => {
        result.title = result.title.toLowerCase();
        return result;
      },
      queryParameterTransformationFn: (queryParameters) => ({
        params: { type: queryParameters.type },
        query: { domains: queryParameters.domainId }
      }),
      staticQueryOptions: { staleTime: STALE_TIME.MEDIUM }
    } as IVeoQueryDefinition<IVeoFetchSchemaParameters, IVeoObjectSchema>
  },
  mutations: {}
};

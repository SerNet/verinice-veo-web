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
import type { IVeoDomainSpecificObjectSchema, IVeoObjectSchema } from '~/types/VeoTypes';
import type { IVeoQueryDefinition } from '../utils/query';
import { STALE_TIME } from '../utils/query';

export interface IVeoFetchSchemaParameters {
  type: string;
  domainId: string;
}

export default {
  queries: {
    fetchSchema: {
      primaryQueryKey: 'schema',
      url: '/api/domains/:domainId/:type/json-schema',
      onDataFetched: (result: any) => {
        const riskAffectedEntities = ['Scope', 'Asset', 'Process'];

        if (riskAffectedEntities.includes(result.title)) {
          // determine the specific anylysis type, e.g. DSRA, GSRA, NIS2RA
          const [analysisType] = Object.keys(result.properties?.riskValues?.properties);

          if (analysisType) {
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
                  ),
                  allOf: [
                    {
                      if: {
                        properties: {
                          potentialImpacts: {
                            maxLength: 0
                          }
                        }
                      },
                      then: {
                        properties: {
                          potentialImpactReasons: {
                            readOnly: true
                          },
                          potentialImpactEffectiveReasons: {
                            readOnly: true
                          },
                          potentialImpactExplanations: {
                            readOnly: true
                          }
                        }
                      }
                    }
                  ]
                };
                return previous;
              },
              {} as Record<string, any>
            );

            result.properties.riskValues.properties[analysisType].properties = {
              potentialImpacts: { properties: analysisTypeProps.potentialImpacts.properties }
            };
          }
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
    } as IVeoQueryDefinition<IVeoFetchSchemaParameters, IVeoDomainSpecificObjectSchema>,
    fetchCISchema: {
      primaryQueryKey: 'ci-schema',
      url: '/api/domains/:domainId/:type/control-implementations/json-schema',
      queryParameterTransformationFn: (queryParameters) => ({
        params: {
          domainId: queryParameters.domainId,
          type: queryParameters.type
        }
      }),
      staticQueryOptions: { staleTime: STALE_TIME.MEDIUM }
    } as IVeoQueryDefinition<IVeoFetchSchemaParameters, IVeoDomainSpecificObjectSchema>,
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

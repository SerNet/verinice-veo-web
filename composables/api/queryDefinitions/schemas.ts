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
import { IVeoObjectSchema } from "~~/types/VeoTypes";
import { IVeoQueryDefinition, STALE_TIME } from "../utils/query";

const route = useRoute();
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
  domainIds: string[];
}

export default {
  queries: {
    fetchSchemas: {
      primaryQueryKey: 'schemas',
      url: '/api/types',
      // Is of type IVeoEntitiesMetaInfo here, but gets returned as IVeoSchemaEndpoints
      onDataFetched: (result: any) => Object.fromEntries(Object.entries(result as IVeoEntitiesMetaInfo).map(([key, value]) => [key, /([a-z]*){(.+)$/.exec(value.collectionUri)?.[1] || value.collectionUri])),
      queryParameterTransformationFn: () => ({}),
      staticQueryOptions: { staleTime: STALE_TIME.INFINITY, placeholderData: {} }
    } as IVeoQueryDefinition<Record<string, never>, IVeoSchemaEndpoints>,
    fetchSchema: {
      primaryQueryKey: 'schema',
      url: '/api/schemas/:type',
      queryParameterTransformationFn: (queryParameters) => ({ params: { type: queryParameters.type }, query: { domains: (queryParameters.domainIds || []).toString() } }),
      staticQueryOptions: { staleTime: STALE_TIME.MEDIUM }
    } as IVeoQueryDefinition<IVeoFetchSchemaParameters, IVeoObjectSchema>
  },
  mutations: {}
};

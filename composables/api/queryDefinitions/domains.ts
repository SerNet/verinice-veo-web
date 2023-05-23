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
import { IVeoBaseObject, IVeoDomainRiskDefinition, IVeoPiaMandatoryRule } from "~~/types/VeoTypes";
import { IVeoMutationDefinition } from "../utils/mutation";
import { IVeoQueryDefinition, STALE_TIME } from "../utils/query";

export interface IVeoDomain extends IVeoBaseObject {
  name: string;
  abbreviation: string;
  description: string;
  catalogs: any[];
  riskDefinitions: {
    [key: string]: IVeoDomainRiskDefinition;
  };
  decisions: {
    piaMandatory: {
      rules: IVeoPiaMandatoryRule[];
      name: { [locale: string]: string };
    };
  };
}

export interface IVeoDomainStatusCount {
  [objectSchema: string]: {
    [subType: string]: {
      [status: string]: number;
    };
  };
}

export interface IVeoFetchDomainParameters {
  id: string;
}

export interface IVeoFetchDomainElementStatusCount {
  id: string;
  unitId: string;
}

export interface IVeoUpdateTypeDefinitionParameters {
  domainId: string;
  objectType: string;
  objectSchema: string;
}

export default {
  queries: {
    fetchDomains: {
      primaryQueryKey: 'domains',
      url: '/api/domains',
      queryParameterTransformationFn: () => ({}),
      staticQueryOptions: {
        staleTime: STALE_TIME.LONG,
        placeholderData: []
      }
    } as IVeoQueryDefinition<Record<string, never>, IVeoDomain[]>,
    fetchDomain: {
      primaryQueryKey: 'domain',
      url: '/api/domains/:id',
      queryParameterTransformationFn: (queryParameters) => ({ params: queryParameters }),
      staticQueryOptions: {
        staleTime: STALE_TIME.MEDIUM
      }
    } as IVeoQueryDefinition<IVeoFetchDomainParameters, IVeoDomain>,
    fetchDomainElementStatusCount: {
      primaryQueryKey: 'domainElementStatusCount',
      url: '/api/domains/:id/element-status-count',
      queryParameterTransformationFn: (queryParameters) => ({ params: { id: queryParameters.id }, query: { unit: queryParameters.unitId } }),
      staticQueryOptions: {
        staleTime: STALE_TIME.REQUEST
      }
    } as IVeoQueryDefinition<IVeoFetchDomainElementStatusCount, IVeoDomainStatusCount>
  },
  mutations: {
    updateTypeDefinitions: {
      primaryQueryKey: 'domain',
      url: `/api/domains/:id/elementtypedefinitions/:type/updatefromobjectschema`,
      method: 'POST',
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: {
          id: mutationParameters.domainId,
          type: mutationParameters.objectType
        },
        json: mutationParameters.objectSchema
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, _variables, _context) => {
          queryClient.invalidateQueries(['object']);
          queryClient.invalidateQueries(['translations']);
        }
      }
    } as IVeoMutationDefinition<IVeoUpdateTypeDefinitionParameters, void>
  }
};

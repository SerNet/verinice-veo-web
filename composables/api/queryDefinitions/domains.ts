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
import {
  IVeoBaseObject,
  IVeoDomainRiskDefinition,
  IVeoEntity,
  IVeoPiaMandatoryRule,
  IVeoElementTypeDefinition
} from '~/types/VeoTypes';
import { IVeoMutationDefinition } from '../utils/mutation';
import { IVeoQueryDefinition, STALE_TIME } from '../utils/query';
import { IVeoRisk } from '~/types/VeoTypes';
import { VeoApiReponseType } from '../utils/request';

export interface IVeoFetchPersonsInDomainParameters {
  domainId: string;
  unitId?: string;
  sortBy?: string;
  sortOrder?: string;
  size?: string;
}

export interface IVeoPersonInDomain {
  id: string;
  designator: string;
  name: string;
  description: string;
  status: string;
  type: string;
  subType: string;
  _self: string;
}

export interface IVeoPersonsInDomain {
  items: IVeoPersonInDomain[];
  totalItemCount: string;
}

export interface IProfile {
  description: string;
  name: string;
  language: string;
  elements: IVeoEntity[];
  risks: IVeoRisk[];
}

export interface IVeoDomain extends IVeoBaseObject {
  _self: string;
  name: string;
  abbreviation: string;
  description: string;
  catalogs: any[];
  riskDefinitions: {
    [key: string]: IVeoDomainRiskDefinition;
  };
  profiles: Record<string, IProfile>;
  decisions: {
    piaMandatory: {
      rules: IVeoPiaMandatoryRule[];
      name: { [locale: string]: string };
    };
  };
  elementTypeDefinitions: {
    [key: string]: IVeoElementTypeDefinition;
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

export interface IVeoApplyProfilesParameters {
  domainId: string;
  profileKey: string;
  unitId: string;
}

export default {
  queries: {
    fetchDomains: {
      primaryQueryKey: 'domains',
      url: '/api/domains',
      queryParameterTransformationFn: () => ({}),
      staticQueryOptions: {
        staleTime: STALE_TIME.REQUEST,
        placeholderData: []
      }
    } as IVeoQueryDefinition<Record<string, never>, IVeoDomain[]>,
    fetchDomain: {
      primaryQueryKey: 'domain',
      url: '/api/domains/:id',
      queryParameterTransformationFn: (queryParameters) => ({
        params: { id: queryParameters.id }
      }),
      staticQueryOptions: {
        staleTime: STALE_TIME.MEDIUM
      }
    } as IVeoQueryDefinition<IVeoFetchDomainParameters, IVeoDomain>,
    fetchDomainElementStatusCount: {
      primaryQueryKey: 'domainElementStatusCount',
      url: '/api/domains/:id/element-status-count',
      queryParameterTransformationFn: (queryParameters) => ({
        params: { id: queryParameters.id },
        query: { unit: queryParameters.unitId }
      }),
      staticQueryOptions: {
        staleTime: STALE_TIME.REQUEST
      }
    } as IVeoQueryDefinition<
      IVeoFetchDomainElementStatusCount,
      IVeoDomainStatusCount
    >,
    fetchPersonsInDomain: {
      primaryQueryKey: 'personsInDomain',
      url: '/api/domains/:domainId/persons',
      queryParameterTransformationFn: (queryParameters) => ({
        params: { domainId: queryParameters.domainId },
        query: {
          unit: queryParameters.unitId,
          sortBy: queryParameters.sortBy || 'name',
          sortOrder: queryParameters.sortOrder || 'asc',
          size: queryParameters.size || '20'
        }
      }),
      staticQueryOptions: {
        staleTime: STALE_TIME.REQUEST
      }
    } as IVeoQueryDefinition<
      IVeoFetchPersonsInDomainParameters,
      IVeoPersonsInDomain
    >
  },
  mutations: {
    updateTypeDefinitions: {
      primaryQueryKey: 'domain',
      url: `/api/content-creation/domains/:id/element-type-definitions/:type/object-schema`,
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
    } as IVeoMutationDefinition<IVeoUpdateTypeDefinitionParameters, void>,
    applyProfile: {
      primaryQueryKey: 'domain',
      url: `/api/domains/:domainId/profiles/:profileKey/units/:unitId`,
      method: 'POST',
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: {
          domainId: mutationParameters.domainId,
          profileKey: mutationParameters.profileKey,
          unitId: mutationParameters.unitId
        }
      }),
      responseType: VeoApiReponseType.VOID,
      staticMutationOptions: {
        // no invalidation needed
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onSuccess: (_queryClient, _data, _variables, _context) => {}
      }
    } as IVeoMutationDefinition<IVeoApplyProfilesParameters, void>
  }
};

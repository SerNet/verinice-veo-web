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
import { Ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import { IVeoQueryTransformationMap, QueryOptions, STALE_TIME, useQuery } from './utils/query';
import { IVeoMutationTransformationMap, MutationOptions, useMutation } from './utils/mutation';
import { IVeoDomain } from '~/types/VeoTypes';

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

export const domainsQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetchAll: () => ({}),
  fetch: (queryParameters: IVeoFetchDomainParameters) => ({ params: queryParameters }),
  fetchElementStatusCount: (queryParameters: IVeoFetchDomainElementStatusCount) => ({ params: { id: queryParameters.id }, query: { unit: queryParameters.unitId } })
};

export const domainsMutationParameterTransformationMap: IVeoMutationTransformationMap = {
  updateTypeDefinition: (mutationParameters: IVeoUpdateTypeDefinitionParameters) => ({
    params: {
      id: mutationParameters.objectType,
      type: mutationParameters.objectType
    },
    json: mutationParameters.objectSchema
  })
};

export const useFetchDomains = (queryOptions?: QueryOptions) =>
  useQuery<void, IVeoDomain[]>('domains', { url: '/api/domains/' }, undefined, domainsQueryParameterTransformationMap.fetchAll, {
    ...queryOptions,
    staleTime: STALE_TIME.LONG,
    placeholderData: []
  });

export const useFetchDomain = (queryParameters: Ref<IVeoFetchDomainParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchDomainParameters, IVeoDomain>('domain', { url: '/api/domains/:id' }, queryParameters, domainsQueryParameterTransformationMap.fetch, {
    ...queryOptions,
    staleTime: STALE_TIME.MEDIUM
  });

export const useFetchDomainElementStatusCount = (queryParameters: Ref<IVeoFetchDomainElementStatusCount>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchDomainElementStatusCount, IVeoDomainStatusCount>('domainElementStatusCount', { url: '/api/domains/:id/element-status-count' }, queryParameters, domainsQueryParameterTransformationMap.fetchElementStatusCount, {
    ...queryOptions,
    staleTime: STALE_TIME.REQUEST
  });

export const useUpdateTypeDefinition = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation(
    'domain',
    { url: `/api/domains/:id/elementtypedefinitions/:type/updatefromobjectschema`, method: 'POST' },
    domainsMutationParameterTransformationMap.updateTypeDefinition,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(['object']);
        queryClient.invalidateQueries(['translations']);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

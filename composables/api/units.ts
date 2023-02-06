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

import { IVeoQueryTransformationMap, QueryOptions, STALE_TIME, useQuery } from './utils/query';
import { IVeoAPIMessage, IVeoUnit } from '~/types/VeoTypes';
import { useQueryClient } from '@tanstack/vue-query';
import { IVeoMutationParameters, IVeoMutationTransformationMap, MutationOptions, useMutation } from './utils/mutation';
import { VeoApiReponseType } from './utils/request';

export interface IVeoFetchUnitParameters {
  id: string;
}

export interface IVeoCreateUnitParameters {
  name: string;
  description: string;
}

export interface IVeoDeleteUnitParameters {
  id: string;
}

export const unitsQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetchAll: () => ({}),
  fetch: (queryParameters: IVeoFetchUnitParameters) => ({ params: queryParameters })
};

export const unitsMutationParameterTransformationMap: IVeoMutationTransformationMap = {
  create: (mutationParameters: IVeoCreateUnitParameters) => ({
    json: mutationParameters
  }),
  delete: (mutationParameters: IVeoDeleteUnitParameters) => ({ params: mutationParameters })
};

export const useFetchUnits = (queryOptions?: QueryOptions) =>
  useQuery<void, IVeoUnit[]>('units', { url: '/api/units' }, undefined, unitsQueryParameterTransformationMap.fetchAll, {
    ...queryOptions,
    staleTime: STALE_TIME.MEDIUM,
    placeholderData: []
  });

export const useFetchUnit = (queryParameters: Ref<IVeoFetchUnitParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchUnitParameters, IVeoUnit>('unit', { url: '/api/units/:id' }, queryParameters, unitsQueryParameterTransformationMap.fetch, {
    ...queryOptions,
    staleTime: STALE_TIME.MEDIUM
  });

export const useCreateUnit = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoCreateUnitParameters, IVeoAPIMessage>(
    'form',
    {
      url: '/api/units',
      method: 'POST'
    },
    unitsMutationParameterTransformationMap.create,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(['units']);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

export const useDeleteUnit = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoDeleteUnitParameters, void>(
    'unit',
    {
      url: '/api/units/:id',
      method: 'DELETE',
      reponseType: VeoApiReponseType.VOID
    },
    unitsMutationParameterTransformationMap.delete,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(['units']);
        queryClient.invalidateQueries(['unit', (variables as unknown as IVeoMutationParameters).params]);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

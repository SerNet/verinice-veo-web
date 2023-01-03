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
import { IVeoMutationParameters, IVeoMutationTransformationMap, MutationOptions, useMutation } from './utils/mutation';
import { IVeoFormSchema, IVeoFormSchemaMeta } from '~/types/VeoTypes';

export interface IVeoFetchFormsParameters {
  domainId: string;
}

export interface IVeoFetchFormParameters {
  domainId: string;
  id: string;
}

export interface IVeoCreateFormParameters {
  domainId: string;
  form: IVeoFormSchema;
}

export interface IVeoUpdateFormParameters {
  id: string;
  domainId: string;
  form: IVeoFormSchema;
}

export const formsQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetchAll: (queryParameters: IVeoFetchFormsParameters) => ({ query: queryParameters }),
  fetch: (queryParameters: IVeoFetchFormParameters) => ({
    params: {
      id: queryParameters.id
    }
  })
};

export const formsMutationParameterTransformationMap: IVeoMutationTransformationMap = {
  create: (mutationParameters: IVeoCreateFormParameters) => ({
    json: { domainId: mutationParameters.domainId, ...mutationParameters.form }
  }),
  update: (mutationParameters: IVeoUpdateFormParameters) => ({
    params: {
      id: mutationParameters.id
    },
    json: { domainId: mutationParameters.domainId, ...mutationParameters.form }
  })
};

export const useFetchForms = (queryParameters: Ref<IVeoFetchFormsParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchFormsParameters, IVeoFormSchemaMeta[]>(
    'forms',
    {
      url: '/api/forms/'
    },
    queryParameters,
    formsQueryParameterTransformationMap.fetchAll,
    { ...queryOptions, staleTime: STALE_TIME.MEDIUM, placeholderData: [] }
  );

export const useFetchForm = (queryParameters: Ref<IVeoFetchFormParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchFormParameters, IVeoFormSchema>(
    'form',
    { url: '/api/forms/:id', onDataFetched: (result) => JSON.parse(JSON.stringify(result).replaceAll('{CURRENT_DOMAIN_ID}', queryParameters.value.domainId)) },
    queryParameters,
    formsQueryParameterTransformationMap.fetch,
    {
      ...queryOptions,
      staleTime: STALE_TIME.MEDIUM
    }
  );

export const useCreateForm = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoCreateFormParameters, string>(
    'form',
    {
      url: '/api/forms',
      method: 'POST'
    },
    formsMutationParameterTransformationMap.create,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(['forms']);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

export const useUpdateForm = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoUpdateFormParameters, void>(
    'form',
    {
      url: '/api/forms/:id',
      method: 'POST'
    },
    formsMutationParameterTransformationMap.update,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries([
          'form',
          {
            domainId: (variables as unknown as IVeoMutationParameters).params?.domainId || '',
            id: (variables as unknown as IVeoMutationParameters).params?.id || ''
          }
        ]);
        queryClient.invalidateQueries(['forms', { domainId: (variables as unknown as IVeoMutationParameters).query?.domainId || '' }]);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

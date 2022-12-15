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
import { Ref } from '@nuxtjs/composition-api';

import { useQueryClient } from '@tanstack/vue-query';
import { IVeoMutationParameters, IVeoMutationTransformationMap, MutationOptions, useMutation } from './utils/mutation';
import { IVeoQueryTransformationMap, QueryOptions, useQuery } from './utils/query';
import { VeoApiReponseType } from './utils/request';

export interface IVeoAccount {
  id: string;
  username: string;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  groups: string[];
  enabled: boolean;
}

export interface IVeoFetchAccountParameters {
  id: string;
}

export interface IVeoCreateAccountParameters {
  username: string;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  groups: [];
}

export interface IVeoUpdateAccountParameters {
  id: string;
  username: string;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  groups: [];
}

export interface IVeoDeleteAccountParameters {
  id: string;
}

export const accountsQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetchAll: () => ({}),
  fetch: (queryParameters: IVeoFetchAccountParameters) => ({ params: queryParameters })
};

export const accountsMutationParameterTransformationMap: IVeoMutationTransformationMap = {
  create: (mutationParameters: IVeoCreateAccountParameters) => ({ json: mutationParameters }),
  update: (mutationParameters: IVeoUpdateAccountParameters) => ({ params: { id: mutationParameters.id }, json: mutationParameters }),
  delete: (mutationParameters: IVeoDeleteAccountParameters) => ({ params: { id: mutationParameters.id } })
};

export const useFetchAccounts = (queryOptions?: QueryOptions) =>
  useQuery<void, IVeoAccount[]>('accounts', { url: '/api/accounts/' }, undefined, accountsQueryParameterTransformationMap.fetchAll, { ...queryOptions, placeholderData: [] });

export const useFetchAccount = (queryParameters: Ref<IVeoFetchAccountParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchAccountParameters, IVeoAccount>('account', { url: '/api/accounts/:id' }, queryParameters, accountsQueryParameterTransformationMap.fetch, queryOptions);

export const useCreateAccount = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoCreateAccountParameters, void>('account', { url: '/api/accounts', method: 'POST' }, accountsMutationParameterTransformationMap.create, {
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['accounts']);
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    }
  });
};

export const useUpdateAccount = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoUpdateAccountParameters, void>(
    'account',
    { url: '/api/accounts/:id', method: 'PUT', reponseType: VeoApiReponseType.VOID },
    accountsMutationParameterTransformationMap.update,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(['accounts']);
        queryClient.invalidateQueries(['account', { id: (variables as unknown as IVeoMutationParameters).params?.id || '' }]);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

export const useDeleteAccount = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoDeleteAccountParameters, void>(
    'account',
    { url: '/api/accounts/:id', method: 'DELETE', reponseType: VeoApiReponseType.VOID },
    accountsMutationParameterTransformationMap.delete,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(['accounts']);
        queryClient.invalidateQueries(['account', { id: (variables as unknown as IVeoMutationParameters).params?.id || '' }]);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

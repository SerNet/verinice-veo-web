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
import { useContext } from '@nuxtjs/composition-api';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';

import { useQueryClient } from '@tanstack/vue-query';
import { IVeoMutationTransformationMap, MutationOptions, useMutation } from './utils/mutation';
import { QueryOptions, useQuery } from './utils/query';
import { IVeoAccount } from '~/plugins/api/account';

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

export const accountsQueryKeys = {
  accounts: ['accounts'] as const,
  account: (queryParameters: IVeoFetchAccountParameters) => ['account', queryParameters.id] as const
};

export const accountsMutationParameterTransformationMap: IVeoMutationTransformationMap = {
  create: (mutationParameters: IVeoCreateAccountParameters) => ({ json: mutationParameters }),
  update: (mutationParameters: IVeoUpdateAccountParameters) => ({ params: { id: mutationParameters.id }, json: mutationParameters }),
  delete: (mutationParameters: IVeoDeleteAccountParameters) => ({ params: { id: mutationParameters.id } })
};

export const useFetchAccounts = (queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoAccount[]>(accountsQueryKeys.accounts, $api.account.fetchAll, {}, { ...queryOptions, placeholderData: [] });
};

export const useFetchAccount = (queryParameters: MaybeRef<IVeoFetchAccountParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoAccount>(accountsQueryKeys.account, $api.account.fetch, queryParameters, queryOptions);
};

export const useCreateAccount = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoCreateAccountParameters, void>('account', { url: '/api/accounts', method: 'POST' }, accountsMutationParameterTransformationMap.create, {
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(accountsQueryKeys.accounts);
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    }
  });
};

export const useUpdateAccount = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoUpdateAccountParameters, void>('account', { url: '/api/accounts/:id', method: 'PUT' }, accountsMutationParameterTransformationMap.update, {
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(accountsQueryKeys.accounts);
      queryClient.invalidateQueries(accountsQueryKeys.account({ id: (variables as unknown as IVeoUpdateAccountParameters).id }));
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    }
  });
};

export const useDeleteAccount = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoDeleteAccountParameters, void>('account', { url: '/api/accounts/:id', method: 'DELETE' }, accountsMutationParameterTransformationMap.delete, {
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(accountsQueryKeys.accounts);
      queryClient.invalidateQueries(accountsQueryKeys.account({ id: (variables as unknown as IVeoDeleteAccountParameters).id }));
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    }
  });
};

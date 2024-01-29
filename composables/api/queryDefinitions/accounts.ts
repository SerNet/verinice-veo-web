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
import { IVeoMutationDefinition } from '../utils/mutation';
import { IVeoQueryDefinition } from '../utils/query';
import { VeoApiReponseType } from '../utils/request';

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

export default {
  queries: {
    fetchAccounts: {
      primaryQueryKey: 'accounts',
      url: '/api/accounts',
      queryParameterTransformationFn: () => ({}),
      staticQueryOptions: { placeholderData: [] },
    } as IVeoQueryDefinition<Record<string, never>, IVeoAccount[]>,
    fetchAccount: {
      primaryQueryKey: 'account',
      url: '/api/accounts/:id',
      queryParameterTransformationFn: (queryParameters) => ({
        params: queryParameters,
      }),
    } as IVeoQueryDefinition<IVeoFetchAccountParameters, IVeoAccount>,
  },
  mutations: {
    createAccount: {
      primaryQueryKey: 'account',
      url: '/api/accounts',
      method: 'POST',
      mutationParameterTransformationFn: (mutationParameters) => ({
        json: mutationParameters,
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, _variables, _context) => {
          queryClient.invalidateQueries(['accounts']);
        },
      },
    } as IVeoMutationDefinition<IVeoCreateAccountParameters, void>,
    updateAccount: {
      primaryQueryKey: 'account',
      url: '/api/accounts/:id',
      method: 'PUT',
      reponseType: VeoApiReponseType.VOID,
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: { id: mutationParameters.id },
        json: mutationParameters,
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries(['accounts']);
          queryClient.invalidateQueries([
            'account',
            { id: variables.params?.id || '' },
          ]);
        },
      },
    } as IVeoMutationDefinition<IVeoUpdateAccountParameters, void>,
    deleteAccount: {
      primaryQueryKey: 'account',
      url: '/api/accounts/:id',
      method: 'DELETE',
      reponseType: VeoApiReponseType.VOID,
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: { id: mutationParameters.id },
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries(['accounts']);
          queryClient.invalidateQueries([
            'account',
            { id: variables.params?.id || '' },
          ]);
        },
      },
    } as IVeoMutationDefinition<IVeoDeleteAccountParameters, void>,
  },
};

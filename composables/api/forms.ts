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

import { QueryOptions, STALE_TIME, useQuery } from './utils/query';
import { MutationOptions, useMutation } from './utils/mutation';
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

export const schemasQueryKeys = {
  forms: (queryParameters: IVeoFetchFormsParameters) => ['forms', queryParameters.domainId] as const,
  form: (queryParameters: IVeoFetchFormParameters) => ['form', queryParameters.domainId, queryParameters.id] as const
};

export const useFetchForms = (queryParameters: MaybeRef<IVeoFetchFormsParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoFormSchemaMeta[]>(schemasQueryKeys.forms, $api.form.fetchAll, queryParameters, { ...queryOptions, staleTime: STALE_TIME.MEDIUM, placeholderData: [] });
};

export const useFetchForm = (queryParameters: MaybeRef<IVeoFetchFormParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoFormSchema>(schemasQueryKeys.form, $api.form.fetch, queryParameters, { ...queryOptions, staleTime: STALE_TIME.MEDIUM });
};

export const useCreateForm = (mutationParameters: MaybeRef<IVeoCreateFormParameters>, mutationOptions?: MutationOptions) => {
  const { $api } = useContext();
  const queryClient = useQueryClient();

  return useMutation('form', $api.form.create, mutationParameters, {
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['form']);
      queryClient.invalidateQueries(['forms']);
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    }
  });
};

export const useUpdateForm = (mutationParameters: MaybeRef<IVeoUpdateFormParameters>, mutationOptions?: MutationOptions) => {
  const { $api } = useContext();
  const queryClient = useQueryClient();

  return useMutation('form', $api.form.update, mutationParameters, {
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['form']);
      queryClient.invalidateQueries(['forms']);
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    }
  });
};

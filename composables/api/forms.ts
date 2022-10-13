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
import { UseQueryOptions } from 'vue-query/lib/vue';
import { MaybeRef } from 'vue-query/lib/vue/types';

import { useQuery } from './utils/query';
import { IVeoFormSchema, IVeoFormSchemaMeta } from '~/types/VeoTypes';

export interface IVeoFetchFormsParameters {
  domainId: string;
}

export interface IVeoFetchFormParameters {
  domainId: string;
  id: string;
}

export const useFetchForms = (queryParameters: MaybeRef<IVeoFetchFormsParameters>, queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
  const { $api } = useContext();

  return useQuery<IVeoFormSchemaMeta[]>('forms', $api.form.fetchAll, queryParameters, { ...queryOptions, staleTime: 10 * 60 * 1000, placeholderData: [] });
};

export const useFetchForm = (queryParameters: MaybeRef<IVeoFetchFormParameters>, queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
  const { $api } = useContext();

  return useQuery<IVeoFormSchema>('form', $api.form.fetch, queryParameters, { ...queryOptions, staleTime: 10 * 60 * 1000 });
};

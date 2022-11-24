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
import { IVeoDomain } from '~/types/VeoTypes';

export interface IVeoFetchDomainParameters {
  id: string;
}

export interface IVeoUpdateTypeDefinitionParameters {
  domainId: string;
  objectType: string;
  objectSchema: string;
}

export const domainsQueryKeys = {
  domains: ['domains'] as const,
  domain: (queryParameters: IVeoFetchDomainParameters) => ['domain', queryParameters.id] as const
};

export const useFetchDomains = (queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoDomain[]>(domainsQueryKeys.domains, $api.domain.fetchAll, {}, { ...queryOptions, staleTime: STALE_TIME.LONG, placeholderData: [] });
};

export const useFetchDomain = (queryParameters: MaybeRef<IVeoFetchDomainParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoDomain>(domainsQueryKeys.domain, $api.domain.fetch, queryParameters, { ...queryOptions, staleTime: STALE_TIME.MEDIUM });
};

export const useUpdateTypeDefinition = (mutationParameters: MaybeRef<IVeoUpdateTypeDefinitionParameters>, mutationOptions?: MutationOptions) => {
  const { $api } = useContext();
  const queryClient = useQueryClient();

  return useMutation('domain', $api.domain.updateTypeDefinition, mutationParameters, {
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['object']);
      queryClient.invalidateQueries(['translations']);
      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    }
  });
};

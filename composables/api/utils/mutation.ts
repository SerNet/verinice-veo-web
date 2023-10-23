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
import { QueryClient, useMutation as vueQueryUseMutation, useQueryClient } from '@tanstack/vue-query';
import { UseMutationOptions } from '@tanstack/vue-query/build/lib';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';
import { omit } from 'lodash';

import { debugCacheAsArrayIncludesPrimaryKey, IVeoQueryDefinition, IVeoQueryParameters } from './query';
import { useRequest } from './request';

export interface MutationOptions<_TVariables, TResult = unknown> extends Omit<UseMutationOptions<TResult, unknown, void, unknown>, 'queryFn' | 'onSuccess'> {
  onSuccess: (queryClient: QueryClient, data: TResult, variables: IVeoMutationParameters, context: any) => any
}

export interface IVeoMutationDefinition<TVariables, TResult> extends Omit<IVeoQueryDefinition<TVariables, TResult>, 'queryParameterTransformationFn' | 'staticQueryOptions'> {
  method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS';
  mutationParameterTransformationFn: (_queryParameters: TVariables) => IVeoMutationParameters;
  staticMutationOptions: MutationOptions<TVariables, TResult>
}

export interface IVeoMutationParameters<TParams = Record<string, any>, TQuery = Record<string, any>> extends IVeoQueryParameters<TParams, TQuery> {
  body?: any;
  json?: any;
}

/**
 * Wrapper for vue-query's useMutation to apply some custom logic to make it work more seamless with the legacy api plugin.
 *
 * @param mutationDefinition Object defining api endpoint, HTTP method, return type and more.
 * @param mutationOptions Options modifying mutation behaviour.
 * @returns Mutation object.
 */
export const useMutation = <TVariables, TResult>(
  mutationDefinition: IVeoMutationDefinition<TVariables, TResult>,
  // Internally (in the mutation definition, we want to force the developer to use onSuccess, as usually every mutation implies invalidating an existing query), however further onSuccess callbacks are optional
  mutationOptions?: Omit<MutationOptions<TVariables, TResult>, 'onSuccess'> & {
    onSuccess?: (queryClient: QueryClient, data: TResult, variables: IVeoMutationParameters, context: any) => void,
  },
  options: { isInvalidating: boolean } = {isInvalidating: true}
) => {
  const { $config } = useNuxtApp();
  const { request } = useRequest();
  const queryClient = useQueryClient();

  const combinedOptions = computed(() => ({
    ...mutationDefinition.staticMutationOptions,
    ...mutationOptions,
    onSuccess: async (data: TResult, variables: IVeoMutationParameters, context: any) => {
      if(options.isInvalidating) {
        await mutationDefinition.staticMutationOptions.onSuccess(queryClient, data, variables, context);
      }
      if(mutationOptions?.onSuccess) {
        await mutationOptions.onSuccess(queryClient, data, variables, context);
      }
    }
  }));

  // Actual mutation getting execute
  // @ts-ignore Some weird typing problems. However everything works
  const result = vueQueryUseMutation<TResult, unknown, IVeoMutationParameters>({
    mutationFn: async (mutationParameters: IVeoMutationParameters) => {
      let result = await request(mutationDefinition.url, { ...mutationParameters, ...omit(mutationDefinition, 'url', 'onDataFetched') });
      if (mutationDefinition.onDataFetched) {
        result = mutationDefinition.onDataFetched(result, mutationParameters);
      }
      return result;
    },
    ...combinedOptions.value
  });

  return {
    ...result,
    mutateAsync: (mutationParameters: MaybeRef<any>) => {
      const transformedParameters = mutationDefinition.mutationParameterTransformationFn(unref(mutationParameters));
      // Debugging stuff
      if ($config.public.debugCache === 'true' || debugCacheAsArrayIncludesPrimaryKey($config.public.debugCache, mutationDefinition.primaryQueryKey)) {
        // eslint-disable-next-line no-console
        console.log(
          `[vueQuery] Mutation "${mutationDefinition.primaryQueryKey}" is running with parameters "${JSON.stringify(mutationParameters)}". Fetching...\nOptions: "${JSON.stringify(
            combinedOptions.value
          )}"`
        );
      }

      return result.mutateAsync(transformedParameters);
    }
  };
};

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
import { QueryClient, useMutation as vueQueryUseMutation } from '@tanstack/vue-query';
import { UseMutationOptions } from '@tanstack/vue-query/build/lib';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';
import { omit } from 'lodash';

import { IVeoQueryDefinition, IVeoQueryParameters } from './query';
import { useRequest } from './request';

export interface MutationOptions<_TVariables, TResult = unknown> extends Omit<UseMutationOptions<TResult, unknown, void, unknown>, 'queryFn' | 'onSuccess'> {
  onSuccess: (queryClient: QueryClient, data: TResult, variables: IVeoMutationParameters, context: any) => any
}

export interface IVeoMutationDefinition<TVariables, TResult> extends Omit<IVeoQueryDefinition<TVariables, TResult>, 'queryParameterTransformationFn' | 'queryOptions'> {
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
 * @param mutationIdentifier Identifier of the mutation used for debugging.
 * @param mutationDefinition Object defining api endpoint, HTTP method and return type
 * @param mutationParameterTransformationFn Function that transforms an object passed from the application (developer friendly) to an object that gets used by the api to generate the url
 * @param mutationOptions Options modifying mutation behaviour.
 * @returns Mutation object.
 */
export const useMutation = <TVariables, TResult>(
  mutationDefinition: IVeoMutationDefinition<TVariables, TResult>,
  mutationOptions?: MutationOptions<TVariables, TResult>
) => {
  const { $config } = useNuxtApp();
  const { request } = useRequest();

  // Actual mutation getting execute
  // @ts-ignore Some weird typing problems. However everything works
  const result = vueQueryUseMutation<TResult, unknown, IVeoMutationParameters>({
    mutationFn: (mutationParameters: IVeoMutationParameters) => async () => {
      let result = await request(mutationDefinition.url, { ...mutationParameters, ...omit(mutationDefinition, 'url', 'onDataFetched') });
      if (mutationDefinition.onDataFetched) {
        result = mutationDefinition.onDataFetched(result, mutationParameters);
      }
      return result;
    },
    ...mutationOptions
  });

  return {
    ...result,
    mutateAsync: (mutationParameters: MaybeRef<any>) => {
      const transformedParameters = mutationDefinition.mutationParameterTransformationFn(unref(mutationParameters));
      // Debugging stuff
      if ($config.debugCache === true || (Array.isArray($config.debugCache) && $config.debugCache.includes(mutationDefinition.primaryQueryKey))) {
        // eslint-disable-next-line no-console
        console.log(
          `[vueQuery] Mutation "${mutationDefinition.primaryQueryKey}" is running with parameters "${JSON.stringify(mutationParameters)}". Fetching...\nOptions: "${JSON.stringify(
            mutationOptions
          )}"`
        );
      }

      return result.mutateAsync(transformedParameters);
    }
  };
};

/* TODO:
 * 1. Add onSuccess to mutations
 * 2. Move all Query composable uses to new Interface
 * 3. Fix remaining api composables
 */

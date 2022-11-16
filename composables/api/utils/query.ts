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
import { computed, reactive, unref, useContext, watch } from '@nuxtjs/composition-api';
import { useQuery as vueQueryUseQuery, useQueryClient } from '@tanstack/vue-query';
import { UseQueryOptions } from '@tanstack/vue-query/build/lib';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';
import { isFunction } from 'lodash';

import { IBaseObject } from '~/lib/utils';

export type QueryOptions = Omit<UseQueryOptions, 'queryKey' | 'queryFn'>;

/**
 * Wrapper for vue-query's useQuery to apply some custom logic to make it work more seamless with the legacy api plugin.
 *
 * @param queryKey query key. Changes to it trigger a refetch. Can either be a string array or a callable function that gets passed the query parameters
 * @param requestFunction Function to call to fetch data (usually a function from the api plugin).
 * @param queryParameters Parameters to pass to the request function.
 * @param queryOptions Options modifiying query behaviour.
 * @returns Query object containing the data and information about the query.
 */
export const useQuery = <T>(
  queryKey: readonly string[] | CallableFunction,
  requestFunction: CallableFunction,
  queryParameters: MaybeRef<IBaseObject>,
  queryOptions?: QueryOptions
) => {
  const { $config } = useContext();

  const evaluatedQueryKey = computed(() => (isFunction(queryKey) ? queryKey(unref(queryParameters)) : queryKey));

  const localQueryKey = reactive([]);

  watch(
    () => evaluatedQueryKey.value,
    (newValue) => {
      Object.assign(localQueryKey, newValue);
    },
    { deep: true, immediate: true }
  );

  // Actual query getting executed
  const result = vueQueryUseQuery<T>(
    localQueryKey,
    () => requestFunction(...transformQueryParameters(evaluatedQueryKey.value[0], requestFunction.name, unref(queryParameters))),
    queryOptions as any
  );

  // Debugging stuff
  if ($config.debugCache === true || (Array.isArray($config.debugCache) && $config.debugCache.includes(evaluatedQueryKey.value[0]))) {
    const queryClient = useQueryClient();

    watch(
      () => result.isFetching?.value,
      (newValue) => {
        if (newValue && result.isStale) {
          const staleTime = queryOptions?.staleTime || queryClient.getDefaultOptions().queries?.staleTime;
          // eslint-disable-next-line no-console
          console.log(
            `[vueQuery] data for query key "${JSON.stringify(evaluatedQueryKey.value)}" is considered stale (stale time is ${staleTime}). Last updated at ${new Date(
              result.dataUpdatedAt.value
            ).toLocaleTimeString()}, now is ${new Date().toLocaleTimeString()}. Fetching...`
          );
        } else if (newValue) {
          // eslint-disable-next-line no-console
          console.log(`[vueQuery] data for "${JSON.stringify(evaluatedQueryKey.value)}" not fetched yet. Fetching...\nOptions: "${JSON.stringify(queryOptions)}"`);
        }
      }
    );
  }

  return result;
};

/**
 * Map containing all keys in the order the options should be passed to the api function as arguments.
 */
const queryParameterMap = new Map<string, string[]>([
  ['accounts_fetchAll', []],
  ['account_fetch', ['id']],
  ['account_create', ['_parameters_']],
  ['account_update', ['id', '_parameters_']],
  ['account__delete', ['id']],
  ['forms_fetchAll', ['domainId']],
  ['form_fetch', ['domainId', 'id']],
  ['objects_fetchAll', ['objectType', 'page', '_parameters_']],
  ['object_fetch', ['objectType', 'id']],
  ['schemas_fetchAll', []],
  ['schema_fetch', ['type', 'domainIds']],
  ['units_fetchAll', []],
  ['unit_fetch', ['id']],
  ['translations_fetch', ['languages']],
  ['domains_fetchAll', []],
  ['domain_fetch', ['id']]
]);

/**
 * Returns the queryParameters object as an array with the values in the correct order to pass them to the api function.
 *
 * @param primaryQueryKey The primary query key of the request, used for identification
 * @param requestFunctionName The name of the api function to be called, used for identification
 * @param queryParameters The object containing all query parameters, some of which will get applied as arguments.
 * @returns An array containing the arguments in the correct order, ready to be passed to the request function.
 */
export const transformQueryParameters = (primaryQueryKey: string, requestFunctionName: string, queryParameters: IBaseObject) => {
  const key = `${primaryQueryKey}_${requestFunctionName}`;

  const returnParameters =
    queryParameterMap.get(key)?.map((parameter) => {
      if (parameter === '_parameters_') {
        return queryParameters;
      } else if (queryParameters[parameter]) {
        return queryParameters[parameter];
      } else {
        throw new Error(`Missing parameter for query "${primaryQueryKey} ${requestFunctionName}": ${parameter}`);
      }
    }) || [];

  return returnParameters;
};

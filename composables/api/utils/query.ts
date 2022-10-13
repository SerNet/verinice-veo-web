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
import { reactive, set, unref, useContext, watch } from '@nuxtjs/composition-api';
import { useQuery as vueQueryUseQuery, useQueryClient } from '@tanstack/vue-query';
import { UseQueryOptions } from '@tanstack/vue-query/build/lib';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';

import { IBaseObject } from '~/lib/utils';

/**
 * Wrapper for vue-query's useQuery to apply some custom logic to make it work more seamless with the legacy api plugin.
 *
 * @param primaryQueryKey Primary key of the query. Shouldn't change. Changes are triggered by changing the query parameters that get added to the query key.
 * @param requestFunction Function to call to fetch data (usually a function from the api plugin).
 * @param queryParameters Parameters to pass to the request function.
 * @param queryOptions Options modifiying query behaviour.
 * @returns Query object containing the data and information about the query.
 */
export const useQuery = <T>(
  primaryQueryKey: string,
  requestFunction: CallableFunction,
  queryParameters: MaybeRef<IBaseObject>,
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) => {
  const { $config } = useContext();

  // We turn the queryOptions (often a computed) into an object that we assign to the query key, in order to not have a ref inside the query key while still maintaining reactivity.
  // const combinedQueryKey = reactive([primaryQueryKey, unref(queryParameters)]);
  const combinedQueryKey = reactive([primaryQueryKey]);
  watch(
    () => unref(queryParameters),
    (newValue) => {
      set(combinedQueryKey, 1, newValue);
    }
  );

  // Actual query getting executed
  const result = vueQueryUseQuery<T>(
    combinedQueryKey,
    () => requestFunction(...transformQueryParameters(primaryQueryKey, requestFunction.name, unref(queryParameters))),
    queryOptions as any
  );

  // Debugging stuff
  if ($config.debugCache === true || (Array.isArray($config.debugCache) && $config.debugCache.includes(primaryQueryKey))) {
    const queryClient = useQueryClient();

    watch(
      () => result.isFetching?.value,
      (newValue) => {
        if (newValue && result.isStale) {
          const staleTime = queryOptions?.staleTime || queryClient.getDefaultOptions().queries?.staleTime;
          // eslint-disable-next-line no-console
          console.log(
            `[vueQuery] data for query key "${JSON.stringify(combinedQueryKey)}" is considered stale (stale time is ${staleTime}). Last updated at ${new Date(
              result.dataUpdatedAt.value
            ).toLocaleTimeString()}, now is ${new Date().toLocaleTimeString()}. Fetching...`
          );
        } else if (newValue) {
          // eslint-disable-next-line no-console
          console.log(`[vueQuery] data for "${JSON.stringify(combinedQueryKey)}" not fetched yet. Fetching...\nOptions: "${JSON.stringify(queryOptions)}"`);
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
  ['objects_fetchAll', ['objectType', 'page', '_parameters_']],
  ['object_fetch', ['objectType', 'id']],
  ['forms_fetchAll', ['domainId']],
  ['form_fetch', ['domainId', 'id']],
  ['schemas_fetch', ['type', 'domainIds']]
]);

/**
 * Returns the queryParameters object as an array with the values in the correct order to pass them to the api function.
 *
 * @param primaryQueryKey The primary query key of the request, used for identification
 * @param requestFunctionName The name of the api function to be called, used for identification
 * @param queryParameters The object containing all query parameters, some of which will get applied as arguments.
 * @returns An array containing the arguments in the correct order, ready to be passed to the request function.
 */
const transformQueryParameters = (primaryQueryKey: string, requestFunctionName: string, queryParameters: IBaseObject) => {
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

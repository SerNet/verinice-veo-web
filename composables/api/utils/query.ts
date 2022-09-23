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
import { unref, useContext } from '@nuxtjs/composition-api';
import { QueryKey } from 'react-query/types/core';
import { useQuery as vueQueryUseQuery, useQueryClient } from 'vue-query';
import { UseQueryOptions } from 'vue-query/lib/vue';
import { MaybeRef } from 'vue-query/lib/vue/types';

import { IBaseObject } from '~/lib/utils';

/**
 * Wrapper for vue-query's useQuery to apply some custom logic to make it work more seamless with the legacy api plugin.
 *
 * @param queryKey Query key of the query. If changed triggers refetch.
 * @param requestFunction Function to call to fetch data (usually a function from the api plugin).
 * @param queryParameters Parameters to pass to the request function.
 * @param queryOptions Options modifiying query behaviour.
 * @returns Query object containing the data and information about the query.
 */
export const useQuery = (
  queryKey: QueryKey,
  requestFunction: CallableFunction,
  queryParameters: MaybeRef<IBaseObject>,
  queryOptions: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) => {
  const { $config } = useContext();

  // Get first part of query key used for debug output
  const primaryQueryKey = Array.isArray(queryKey) ? queryKey[0] : queryKey;

  // Find out whether debug information should be displayed.
  const outputDebugInformation = $config.debugCache === true || (Array.isArray($config.debugCache) && $config.debugCache.includes(primaryQueryKey));

  if (outputDebugInformation) {
    // eslint-disable-next-line no-console
    console.log(`[vueQuery] useQuery called with query key "${JSON.stringify(unref(queryKey))}" and options "${JSON.stringify(queryOptions)}"`);
  }

  // Actual query getting executed
  const result = vueQueryUseQuery(queryKey, () => requestFunction(...transformQueryParameters(primaryQueryKey, requestFunction.name, unref(queryParameters))), queryOptions);

  if (outputDebugInformation && !result.dataUpdatedAt.value) {
    // eslint-disable-next-line no-console
    console.log(`[vueQuery] data for "${JSON.stringify(unref(queryKey))}" not fetched yet. Fetching...`);
  } else if (outputDebugInformation && result.isStale) {
    const queryClient = useQueryClient();

    const staleTime = queryOptions.staleTime || queryClient.getDefaultOptions().queries?.staleTime;
    // eslint-disable-next-line no-console
    console.log(
      `[vueQuery] data for query key "${JSON.stringify(unref(queryKey))}" is considered stale (stale time is ${staleTime}). Last updated at ${new Date(
        result.dataUpdatedAt.value
      ).toLocaleTimeString()}, now is ${new Date().toLocaleTimeString()}. Fetching...`
    );
  }

  return result;
};

/**
 * Map containing all keys in the order the options should be passed to the api function as arguments.
 */
const queryParameterMap = new Map<string, string[]>([['objects_fetchAll', ['objectType', 'page', '_parameters_']]]);

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

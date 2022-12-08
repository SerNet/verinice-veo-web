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
import { computed, reactive, ref, Ref, unref, useContext, watch } from '@nuxtjs/composition-api';
import { useQuery as vueQueryUseQuery, useQueries as VueQueryUseQueries, useQueryClient } from '@tanstack/vue-query';
import { UseQueryOptions } from '@tanstack/vue-query/build/lib';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';
import { QueryObserverResult } from '@tanstack/query-core/build/lib/types';
import { cloneDeep, isFunction } from 'lodash';

import { VeoApiReponseType } from './request';
import { IBaseObject } from '~/lib/utils';

export type QueryOptions = Omit<UseQueryOptions, 'queryKey' | 'queryFn'>;

export interface IVeoQueryDefinition {
  url: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS';
  reponseType?: VeoApiReponseType;
}

export interface IVeoQueryParameters {
  params?: IBaseObject;
  query?: IBaseObject;
}

export const STALE_TIME = {
  NONE: 0, // No stale time
  REQUEST: 1000, // 1 seconds
  LONG: 60 * 60 * 1000, // 60 minutes
  MEDIUM: 10 * 60 * 1000, // 10 minutes
  INFINITY: Infinity // Only refetch on page reload
};

/**
 * Wrapper for vue-query's useQuery to apply some custom logic to make it work more seamless with the legacy api plugin and add optional debugging output.
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
    ({ queryKey }) => {
      const localQueryKey = cloneDeep(queryKey as any as string[]);
      // Remove first parameter, as this is just the query key
      localQueryKey.shift();
      return requestFunction(...localQueryKey);
    },
    queryOptions as any
  );

  // Debugging stuff
  if ($config.debugCache === true || (Array.isArray($config.debugCache) && $config.debugCache.includes(evaluatedQueryKey.value[0]))) {
    const queryClient = useQueryClient();

    watch(
      () => result.isFetching?.value,
      (newValue) => {
        if (newValue && result.isStale.value) {
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
      },
      { immediate: true }
    );
  }

  return result;
};

/**
 * Wrapper for vue-query's useQueries to provide more debugging output and have a similiar interface usage to our own useQuery
 *
 * @param queryKeys query key array. Changes to it trigger a refetch. Each entry corresponds to a new query, so make sure to pass the same amount of queryParameters and queryKeys.
 * @param requestFunction Function to call to fetch data (usually a function from the api plugin).
 * @param queryParameters Array with parameters to pass to the request function.
 * @param queryOptions Options modifiying query behaviour.
 * @returns Array containing query objects containing the data and information about the query. NOT reactive, so you have to watch the results in your components.
 */
export const useQueries = <T>(
  queryKeys: Ref<(readonly string[] | CallableFunction)[]>,
  requestFunction: CallableFunction,
  queryParameters: Ref<IBaseObject[]>,
  queryOptions?: QueryOptions
) => {
  const { $config } = useContext();

  // Query key after all functions that might be part of it have been run with the parameters passed
  const evaluatedQueryKey = computed(() => queryKeys.value.map((queryKey, index) => (isFunction(queryKey) ? queryKey(unref(queryParameters)[index]) : queryKey)));

  // Key that gets assigned as otherwise useQueries doesn't pick up the changes
  const localQueryKey = reactive<any[][]>([]);

  const queries = ref<any[]>([]);

  watch(
    () => evaluatedQueryKey.value,
    (newValue) => {
      Object.assign(localQueryKey, newValue);

      queries.value = localQueryKey.length
        ? localQueryKey.map((queryKey) => ({
            queryKey,
            queryFn: () => {
              const localQueryKey = cloneDeep(queryKey as any as string[]);
              localQueryKey.shift();
              return requestFunction(...localQueryKey);
            },
            ...queryOptions
          }))
        : [{ queryKey: ['unnecessary'], queryFn: () => null }];
    },
    { deep: true, immediate: true }
  );

  // Actual query getting executed
  const result = VueQueryUseQueries({ queries });

  // Debugging stuff
  if ($config.debugCache === true || (Array.isArray($config.debugCache) && $config.debugCache.includes(evaluatedQueryKey.value[0][0]))) {
    const queryClient = useQueryClient();

    watch(
      () => result[0]?.isFetching,
      (newValue) => {
        if (newValue && result[0]?.isStale) {
          const staleTime = queryOptions?.staleTime || queryClient.getDefaultOptions().queries?.staleTime;
          // eslint-disable-next-line no-console
          console.log(
            `[vueQuery] data for query key "${JSON.stringify(evaluatedQueryKey.value)}" is considered stale (stale time is ${staleTime}). Last updated at ${new Date(
              result[0]?.dataUpdatedAt
            ).toLocaleTimeString()}, now is ${new Date().toLocaleTimeString()}. Fetching...`
          );
        } else if (newValue) {
          // eslint-disable-next-line no-console
          console.log(`[vueQuery] data for "${JSON.stringify(evaluatedQueryKey.value)}" not fetched yet. Fetching...\nOptions: "${JSON.stringify(queryOptions)}"`);
        }
      },
      { immediate: true }
    );
  }

  return result as QueryObserverResult<T, unknown>[];
};

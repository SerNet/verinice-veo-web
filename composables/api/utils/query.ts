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
import { Ref } from 'vue';
import { useQuery as vueQueryUseQuery, useQueries as VueQueryUseQueries, useQueryClient } from '@tanstack/vue-query';
import { UseQueryOptions } from '@tanstack/vue-query/build/lib';
import { QueryObserverResult } from '@tanstack/query-core/build/lib/types';
import { omit } from 'lodash';

import { useRequest, VeoApiReponseType } from './request';

export type QueryOptions = Omit<UseQueryOptions, 'queryKey' | 'queryFn'>;

export interface IVeoQueryDefinition<TVariables, TResult = any> {
  primaryQueryKey: string;
  url: string;
  queryParameterTransformationFn: (_queryParameters: TVariables) => IVeoQueryParameters;
  reponseType?: VeoApiReponseType;
  onDataFetched?: (result: TResult, queryParameters: IVeoQueryParameters) => TResult;
  staticQueryOptions?: QueryOptions;
}

export interface IVeoQueryParameters<TParams = Record<string, any>, TQuery = Record<string, any>> {
  params?: TParams;
  query?: TQuery;
}

export const STALE_TIME = {
  NONE: 0, // No stale time
  REQUEST: 1000, // 1 seconds
  LONG: 60 * 60 * 1000, // 60 minutes
  MEDIUM: 10 * 60 * 1000, // 10 minutes
  INFINITY: Infinity // Only refetch on page reload
};

export const debugCacheAsArrayIncludesPrimaryKey = (configValue: string | undefined, primaryQueryKey: string) => {
  if(!configValue || !configValue.startsWith('[') || !configValue.endsWith(']')) {
    return false;
  }
  try {
    return JSON.parse(configValue).includes(primaryQueryKey);
  } catch (error) {
    console.warn('Couldn\'t parse debug cache: ', error);
    return false;
  }
};

/**
 * Wrapper for vue-query's useQuery to apply some custom logic to make it work more seamless with the legacy api plugin and add optional debugging output.
 *
 * @param queryDefinition Defines url, return type, static query options and more.
 * @param queryParameters Parameters to pass to the request function.
 * @param queryOptions Options modifiying query behaviour.
 * @returns Query object containing the data and information about the query.
 */
export const useQuery = <TVariables = undefined, TResult = any>(
  queryDefinition: IVeoQueryDefinition<TVariables, TResult>,
  queryParameters?: Ref<TVariables>,
  queryOptions?: QueryOptions
) => {
  const { $config } = useNuxtApp();
  const { request } = useRequest();

  const combinedOptions = computed(() => ({
    ...queryDefinition.staticQueryOptions,
    ...queryOptions
  }));

  // Generating query key based on identifier and the query parameters. This causes the query to get executed again if the query parameters change
  const queryKey = reactive<any[]>([queryDefinition.primaryQueryKey]);
  watch(
    () => queryParameters?.value,
    (newValue) => {
      if (newValue) {
        queryKey[1] = newValue;
      }
    },
    { deep: true, immediate: true }
  );

  // Actual query getting executed
  const result = vueQueryUseQuery<TResult, any>(
    queryKey,
    async () => {
      const transformedQueryParameters = queryParameters ? queryDefinition.queryParameterTransformationFn(unref(queryParameters)) : {};
      let result = await request(queryDefinition.url, { ...transformedQueryParameters, ...omit(queryDefinition, 'url', 'onDataFetched') });
      if (queryDefinition.onDataFetched) {
        result = queryDefinition.onDataFetched(result, transformedQueryParameters);
      }
      return result;
    },
    combinedOptions as any
  );

  // Debugging stuff
  if ($config.public.debugCache === 'true' || debugCacheAsArrayIncludesPrimaryKey($config.public.debugCache, queryDefinition.primaryQueryKey)) {
    const queryClient = useQueryClient();

    watch(
      () => result.isFetching?.value,
      (newValue) => {
        if (newValue && result.isStale.value) {
          const staleTime = combinedOptions.value?.staleTime || queryClient.getDefaultOptions().queries?.staleTime;
          // eslint-disable-next-line no-console
          console.log(
            `[vueQuery] data for query "${JSON.stringify(queryDefinition.primaryQueryKey)}" with parameters "${JSON.stringify(
              queryParameters?.value
            )}" is considered stale (stale time is ${staleTime}). Last updated at ${new Date(
              result.dataUpdatedAt.value
            ).toLocaleTimeString()}, now is ${new Date().toLocaleTimeString()}. Fetching...`
          );
        } else if (newValue) {
          // eslint-disable-next-line no-console
          console.log(
            `[vueQuery] data for query "${JSON.stringify(queryDefinition.primaryQueryKey)}" with parameters "${JSON.stringify(
              queryParameters?.value
            )}" not fetched yet. Fetching...\nOptions: "${JSON.stringify(combinedOptions.value)}"`
          );
        }
      },
      { immediate: true }
    );
  }

  return result;
};

/**
 * Wrapper for request composable to provde the same interface as the query composable so that each request
 * can either be made synchronous or asynchronous.
 * Responses of requests made by this composable get written to the vue query cache the same way as the query
 * composable would do.
 * 
 * @param queryDefinition Defines url and return type of the request.
 * @param queryParameters Parameters to pass to the request function.
 * @returns Result of request without any additional info.
 * @throws Throws an error if request fails
 */
export const useQuerySync  = async <TVariables = undefined, TResult = any>(
  queryDefinition: IVeoQueryDefinition<TVariables, TResult>,
  queryParameters?: TVariables
) => {
  const { request } = useRequest();

  // Make sync request
  const transformedQueryParameters = queryParameters ? queryDefinition.queryParameterTransformationFn(queryParameters) : {};
  let result = await request(queryDefinition.url, { ...transformedQueryParameters, ...omit(queryDefinition, 'url', 'onDataFetched') });
  if (queryDefinition.onDataFetched) {
    result = queryDefinition.onDataFetched(result, transformedQueryParameters);
  }

  // Save to vue query cache
  try {
    const queryClient = useQueryClient();
    queryClient.setQueryData([queryDefinition.primaryQueryKey, queryParameters], result);
  } catch (e) {
    console.warn('Couldn\'t set queried data:', e);
  }
  

  return result as TResult;
};

/**
 * Wrapper for vue-query's useQueries to provide more debugging output and have a similiar interface usage to our own useQuery
 *
 * @param queryDefinition Defines url, return type, static query options and more.
 * @param queryParameters Parameters to pass to the request function. Each array entries results in a new query.
 * @param queryOptions Options modifiying query behaviour.
 * @returns Array containing query objects containing the data and information about the query. NOT reactive, so you have to watch the results in your components.
 */
export const useQueries = <TVariables = Record<string, any>, TResult = any>(
  queryDefinition: IVeoQueryDefinition<TVariables, TResult>,
  queryParameters: Ref<TVariables[]>,
  queryOptions?: QueryOptions
) => {
  const { request } = useRequest();

  const combinedOptions = computed(() => ({
    ...queryDefinition.staticQueryOptions,
    ...queryOptions
  }));

  const queries = ref<any[]>([]);
  
  watch(
    () => queryParameters.value,
    (newValue) => {
      queries.value = newValue.length
        ? newValue.map((query) => ({
          queryKey: [queryDefinition.primaryQueryKey, query],
          queryFn: async () => {
            const transformedQueryParameters = queryDefinition.queryParameterTransformationFn(unref(query));
            let result = await request(queryDefinition.url, {
              ...transformedQueryParameters,
              ...omit(queryDefinition, 'url', 'onDataFetched')
            });
            if (queryDefinition.onDataFetched) {
              result = queryDefinition.onDataFetched(result, transformedQueryParameters);
            }
            return result;
          },
          ...combinedOptions.value
        }))
        : [{ queryKey: ['unnecessary'], queryFn: () => null }];
    },
    { deep: true, immediate: true }
  );

  // Actual query getting executed
  const result = VueQueryUseQueries({ queries });

  return result as QueryObserverResult<TResult, unknown>[];
};

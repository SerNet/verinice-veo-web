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
import { reactive, ref, Ref, set, unref, useContext, watch } from '@nuxtjs/composition-api';
import { useQuery as vueQueryUseQuery, useQueries as VueQueryUseQueries, useQueryClient } from '@tanstack/vue-query';
import { UseQueryOptions } from '@tanstack/vue-query/build/lib';
import { QueryObserverResult } from '@tanstack/query-core/build/lib/types';
import { omit } from 'lodash';

import { useRequest, VeoApiReponseType } from './request';
import { IBaseObject } from '~/lib/utils';

export type QueryOptions = Omit<UseQueryOptions, 'queryKey' | 'queryFn'>;

export interface IVeoQueryDefinition<TResult = any> {
  url: string;
  reponseType?: VeoApiReponseType;
  onDataFetched?: (result: TResult) => TResult;
}

export interface IVeoQueryParameters<TParams = IBaseObject, TQuery = IBaseObject> {
  params?: TParams;
  query?: TQuery;
}

export interface IVeoQueryTransformationMap {
  [operation: string]: (mutationParameters: any) => IVeoQueryParameters;
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
 * @param queryIdentifier Used for debugging and identifying all requests that get made to the defined endpoint. (Developer note: If you have two queries with the same URL and method, you are probably doing something wrong)
 * @param queryDefinition Defines url and return type of the request.
 * @param queryParameters Parameters to pass to the request function.
 * @param queryParameterTransformationFn Function that transforms an object passed from the application (developer friendly) to an object that gets used by the api to generate the url
 * @param queryOptions Options modifiying query behaviour.
 * @returns Query object containing the data and information about the query.
 */
export const useQuery = <TVariable = IBaseObject, TResult = any>(
  queryIdentifier: string,
  queryDefinition: IVeoQueryDefinition<TResult>,
  queryParameters: Ref<TVariable> | undefined,
  queryParameterTransformationFn: (parameters: TVariable | void) => IVeoQueryParameters,
  queryOptions?: QueryOptions
) => {
  const { $config } = useContext();
  const { request } = useRequest();

  // Generating query key based on identifier and the query parameters. This causes the query to get executed again if the query parameters change
  const queryKey = reactive<any[]>([queryIdentifier]);
  watch(
    () => queryParameters?.value,
    (newValue) => {
      if (newValue) {
        set(queryKey, 1, newValue);
      }
    },
    { deep: true, immediate: true }
  );

  // Actual query getting executed
  const result = vueQueryUseQuery<TResult>(
    queryKey,
    async () => {
      let result = await request(queryDefinition.url, { ...queryParameterTransformationFn(unref(queryParameters)), ...omit(queryDefinition, 'url', 'onDataFetched') });
      if (queryDefinition.onDataFetched) {
        result = queryDefinition.onDataFetched(result);
      }
      return result;
    },
    queryOptions as any
  );

  // Debugging stuff
  if ($config.debugCache === true || (Array.isArray($config.debugCache) && $config.debugCache.includes(queryIdentifier))) {
    const queryClient = useQueryClient();

    watch(
      () => result.isFetching?.value,
      (newValue) => {
        if (newValue && result.isStale.value) {
          const staleTime = queryOptions?.staleTime || queryClient.getDefaultOptions().queries?.staleTime;
          // eslint-disable-next-line no-console
          console.log(
            `[vueQuery] data for query "${JSON.stringify(queryIdentifier)}" with parameters "${JSON.stringify(
              queryParameters?.value
            )}" is considered stale (stale time is ${staleTime}). Last updated at ${new Date(
              result.dataUpdatedAt.value
            ).toLocaleTimeString()}, now is ${new Date().toLocaleTimeString()}. Fetching...`
          );
        } else if (newValue) {
          // eslint-disable-next-line no-console
          console.log(
            `[vueQuery] data for query "${JSON.stringify(queryIdentifier)}" with parameters "${JSON.stringify(
              queryParameters?.value
            )}" not fetched yet. Fetching...\nOptions: "${JSON.stringify(queryOptions)}"`
          );
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
 * @param queryIdentifier Used for debugging and identifying all requests that get made to the defined endpoint. (Developer note: If you have two queries with the same URL and method, you are probably doing something wrong)
 * @param queryDefinition Defines url and return type of the request.
 * @param queryParameters Parameters to pass to the request function. Each array entries results in a new query
 * @param queryParameterTransformationFn Function that transforms an object passed from the application (developer friendly) to an object that gets used by the api to generate the url
 * @param queryOptions Options modifiying query behaviour.
 * @returns Array containing query objects containing the data and information about the query. NOT reactive, so you have to watch the results in your components.
 */
export const useQueries = <TVariable = IBaseObject, TResult = any>(
  queriesIdentifier: string,
  queryDefinition: IVeoQueryDefinition<TResult>,
  queryParameters: Ref<(TVariable | void)[]>,
  queryParameterTransformationFn: (parameters: TVariable | void) => IVeoQueryParameters,
  queryOptions?: QueryOptions
) => {
  const { request } = useRequest();

  const queries = ref<any[]>([]);
  watch(
    () => queryParameters.value,
    (newValue) => {
      queries.value = newValue.length
        ? newValue.map((query) => ({
            queryKey: [queriesIdentifier, query],
            queryFn: async () => {
              let result = await request(queryDefinition.url, {
                ...queryParameterTransformationFn(unref(query)),
                ...omit(queryDefinition, 'url', 'onDataFetched')
              });
              if (queryDefinition.onDataFetched) {
                result = queryDefinition.onDataFetched(result);
              }
              return result;
            },
            ...queryOptions
          }))
        : [{ queryKey: ['unnecessary'], queryFn: () => null }];
    },
    { deep: true, immediate: true }
  );

  // Actual query getting executed
  const result = VueQueryUseQueries({ queries });

  return result as QueryObserverResult<TResult, unknown>[];
};

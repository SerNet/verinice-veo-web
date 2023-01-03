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

import { IVeoQueryTransformationMap, QueryOptions, STALE_TIME, useQuery } from './utils/query';
import { IVeoCatalog, IVeoCatalogItem } from '~/types/VeoTypes';

export interface IVeoFetchCatalogsParameters {
  domainId: string;
}

export interface IVeoFetchCatalogParameters {
  id: string;
}

export interface IVeoFetchCatalogItemsParameters {
  catalogId: string;
  domainId: string;
}

export interface IVeoFetchCatalogItemParameters {
  catalogId: string;
  itemId: string;
  domainId: string;
}

export const catalogsQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetchAll: (queryParameters: IVeoFetchCatalogsParameters) => ({ query: { domain: queryParameters.domainId } }),
  fetch: (queryParameters: IVeoFetchCatalogParameters) => ({ params: queryParameters }),
  fetchItems: (queryParameters: IVeoFetchCatalogItemsParameters) => ({ params: { catalogId: queryParameters.catalogId }, query: { domain: queryParameters.domainId } }),
  fetchItem: (queryParameters: IVeoFetchCatalogItemParameters) => ({
    params: { catalogId: queryParameters.catalogId, itemId: queryParameters.itemId },
    query: { domain: queryParameters.domainId }
  })
};

export const useFetchCatalogs = (queryParameters: Ref<IVeoFetchCatalogsParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchCatalogsParameters, IVeoCatalog[]>('catalogs', { url: '/api/catalogs/' }, queryParameters, catalogsQueryParameterTransformationMap.fetchAll, {
    ...queryOptions,
    staleTime: STALE_TIME.INFINITY,
    placeholderData: []
  });

export const useFetchCatalog = (queryParameters: Ref<IVeoFetchCatalogParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchCatalogParameters, IVeoCatalog>('catalog', { url: '/api/catalogs/:id' }, queryParameters, catalogsQueryParameterTransformationMap.fetch, {
    ...queryOptions,
    staleTime: STALE_TIME.INFINITY
  });

export const useFetchCatalogItems = (queryParameters: Ref<IVeoFetchCatalogItemsParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchCatalogItemsParameters, IVeoCatalogItem[]>(
    'catalogItems',
    { url: '/api/catalogs/:catalogId/items' },
    queryParameters,
    catalogsQueryParameterTransformationMap.fetchItems,
    {
      ...queryOptions,
      staleTime: STALE_TIME.INFINITY,
      placeholderData: []
    }
  );

export const useFetchCatalogItem = (queryParameters: Ref<IVeoFetchCatalogItemParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchCatalogItemParameters, IVeoCatalogItem>(
    'catalogItem',
    { url: '/api/catalogs/:catalogId/items/:itemId' },
    queryParameters,
    catalogsQueryParameterTransformationMap.fetchItem,
    {
      ...queryOptions,
      staleTime: STALE_TIME.INFINITY
    }
  );

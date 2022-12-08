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

import { QueryOptions, STALE_TIME, useQuery } from './utils/query';
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

export const domainsQueryKeys = {
  catalogs: (queryParameters: IVeoFetchCatalogsParameters) => ['catalogs', queryParameters.domainId] as const,
  catalog: (queryParameters: IVeoFetchCatalogParameters) => ['catalog', queryParameters.id] as const,
  catalogItems: (queryParameters: IVeoFetchCatalogItemsParameters) => ['catalogItems', queryParameters.catalogId, queryParameters.domainId] as const,
  catalogItem: (queryParameters: IVeoFetchCatalogItemParameters) => ['catalogItems', queryParameters.catalogId, queryParameters.itemId, queryParameters.domainId] as const
};

export const useFetchCatalogs = (queryParameters: MaybeRef<IVeoFetchCatalogsParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoCatalog[]>(domainsQueryKeys.catalogs, $api.catalog.fetchAll, queryParameters, { ...queryOptions, staleTime: STALE_TIME.INFINITY, placeholderData: [] });
};

export const useFetchCatalog = (queryParameters: MaybeRef<IVeoFetchCatalogParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoCatalog>(domainsQueryKeys.catalog, $api.catalog.fetch, queryParameters, { ...queryOptions, staleTime: STALE_TIME.INFINITY });
};

export const useFetchCatalogItems = (queryParameters: MaybeRef<IVeoFetchCatalogItemsParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoCatalogItem[]>(domainsQueryKeys.catalogItems, $api.catalog.fetchItems, queryParameters, {
    ...queryOptions,
    staleTime: STALE_TIME.INFINITY,
    placeholderData: []
  });
};

export const useFetchCatalogItem = (queryParameters: MaybeRef<IVeoFetchCatalogItemParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoCatalogItem>(domainsQueryKeys.catalogItem, $api.catalog.fetchItem, queryParameters, { ...queryOptions, staleTime: STALE_TIME.INFINITY });
};

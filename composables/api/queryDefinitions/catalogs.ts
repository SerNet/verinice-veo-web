/*
 * verinice.veo web
 * Copyright (C) 2023  Jonas Heitmann
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
import { IVeoBaseObject, IVeoLink } from "~~/types/VeoTypes";
import { IVeoQueryDefinition, STALE_TIME } from "../utils/query";

export interface IVeoCatalog extends IVeoBaseObject {
  name: string;
  domainTemplate: IVeoLink;
  catalogItems: IVeoLink[];
}

export interface IVeoCatalogItem extends IVeoBaseObject {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  catalog: IVeoLink;
  tailoringReferences: {
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    referenceType: string;
    catalogItem: IVeoLink;
    attributes: Record<string, any>;
    type: string;
    id: string;
  }[];
  namespace: string;
  element: IVeoLink;
}

export interface IVeoFetchCatalogsParameters {
  domainId: string;
}

export interface IVeoFetchCatalogParameters {
  id: string;
}

export interface IVeoFetchCatalogItemsParameters {
  catalogId: string;
  domainId: string;
  elementType: string;
  subType: string;
  size: string;
  page: string;
  sortBy: string;
  sortOrder: string;
}

export interface IVeoFetchCatalogItemParameters {
  catalogId: string;
  itemId: string;
  domainId: string;
}

export default {
  queries: {
    fetchCatalogs: {
      primaryQueryKey: 'catalogs',
      url: '/api/catalogs',
      queryParameterTransformationFn: (queryParameters) => ({ query: { domain: queryParameters.domainId } }),
      staticQueryOptions: {
        staleTime: STALE_TIME.INFINITY,
        placeholderData: []
      }
    } as IVeoQueryDefinition<IVeoFetchCatalogsParameters, IVeoCatalog[]>,
    fetchCatalogItemsFromCatalogsEndpoint: {
      primaryQueryKey: 'catalogItems',
      url: '/api/catalogs/:catalogId/items',
      queryParameterTransformationFn: (queryParameters) => ({ params: { catalogId: queryParameters.catalogId }, query: { domain: queryParameters.domainId } }),
      staticQueryOptions: {
        staleTime: STALE_TIME.INFINITY,
        placeholderData: []
      }
    } as IVeoQueryDefinition<IVeoFetchCatalogItemsParameters, IVeoCatalogItem[]>,
    fetchCatalogItems: {
      primaryQueryKey: 'catalogItems7',
      url: '/api/domains/:domainId/catalog-items',
      queryParameterTransformationFn: (queryParameters) => {
        return ({
          params: { domainId: queryParameters.domainId },
          query: {
            elementType: queryParameters.elementType,
            subType: queryParameters.subType,
            size: queryParameters.size,
            page: queryParameters.page,
            sortBy: queryParameters.sortBy,
            sortOrder: queryParameters.sortOrder
          }
        });},
      staticQueryOptions: {
        staleTime: STALE_TIME.INFINITY,
        placeholderData: []
      }
    } as IVeoQueryDefinition<IVeoFetchCatalogItemsParameters, IVeoCatalogItem[]>,
    fetchCatalogItem: {
      primaryQueryKey: 'catalogItem',
      url: '/api/catalogs/:catalogId/items/:itemId',
      queryParameterTransformationFn: (queryParameters) => ({
        params: { catalogId: queryParameters.catalogId, itemId: queryParameters.itemId },
        query: { domain: queryParameters.domainId }
      }),
      staticQueryOptions: {
        staleTime: STALE_TIME.INFINITY
      }
    } as IVeoQueryDefinition<IVeoFetchCatalogItemParameters, IVeoCatalogItem>,
    fetchCatalogItemTypeCount: {
      primaryQueryKey: 'catalogItemTypeCount',
      url: '/api/domains/:domainId/catalog-items/type-count',
      queryParameterTransformationFn: (queryParameters) => ({ params: { domainId: queryParameters.domainId } }),
      staticQueryOptions: {
        staleTime: STALE_TIME.INFINITY
      }
    }

  },
  mutations: {}
};

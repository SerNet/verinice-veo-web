/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann
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
import { Client } from '~/plugins/api';
import { IVeoCatalog, IVeoCatalogItem, IVeoCatalogItemListItem } from '~/types/VeoTypes';

export default function (api: Client) {
  return {
    /**
     * Loads all catalogs
     *
     * @param domainId The id of the domain to fetch the catalogs for.
     * @param params Additional request params
     */
    fetchAll(domainId: string, params: Record<string, string> = {}): Promise<IVeoCatalog[]> {
      params.domain = domainId;

      return api.req('/api/catalogs/', {
        params
      });
    },

    /**
     * Loads a catalog by its uuid
     *
     * @param params Additional request params
     */
    fetch(id: string, params: Record<string, string> = {}): Promise<IVeoCatalog> {
      return api.req(`/api/catalogs/${id}`, {
        params
      });
    },

    /**
     * Load all items belonging to a catalog.
     *
     * @param catalogId Id of the catalog to fetch the items for.
     * @param params Additional request params.
     */
    fetchItems(catalogId: string, domainId: string, params: Record<string, string> = {}): Promise<IVeoCatalogItemListItem[]> {
      params.domain = domainId;

      return api.req(`/api/catalogs/${catalogId}/items`, {
        params
      });
    },

    /**
     * Load a specific catalog item
     *
     * @param catalogId Id of the catalog to fetch the items for.
     * @param params Additional request params.
     */
    fetchItem(catalogId: string, itemId: string, domainId: string, params: Record<string, string> = {}): Promise<IVeoCatalogItem> {
      params.domain = domainId;

      return api.req(`/api/catalogs/${catalogId}/items/${itemId}`, {
        params
      });
    }
  };
}

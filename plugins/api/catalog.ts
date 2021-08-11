import { Client } from '~/plugins/api';
import { IVeoCatalog, IVeoCatalogItem } from '~/types/VeoTypes';

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
    fetchItems(catalogId: string, domainId: string, params: Record<string, string> = {}): Promise<IVeoCatalogItem[]> {
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

import { isArray } from 'lodash';
import { Client } from '~/plugins/api';

import { IVeoAPIMessage, IVeoUnit } from '~/types/VeoTypes';

export default function (api: Client) {
  return {
    /**
     * Loads all Units
     *
     * NOT PAGINATED
     *
     * @param parent
     */
    fetchAll(params?: Record<string, string>): Promise<IVeoUnit[]> {
      return api.req('/api/units', {
        params
      });
    },

    /**
     * Creates a Unit
     *
     * NOT PAGINATED
     *
     * @param unit
     */
    create(unit: Object): Promise<void> {
      return api.req('/api/units', {
        method: 'POST',
        json: unit
      });
    },

    /**
     * Loads an Unit
     *
     * NOT PAGINATED
     *
     * @param id
     */
    fetch(id: string): Promise<IVeoUnit> {
      return api.req(`/api/units/${id}`);
    },

    /**
     * Updates a Unit
     *
     * NOT PAGINATED
     *
     * @param id
     * @param unit
     */
    update(id: string, unit: Object): Promise<IVeoUnit> {
      return api.req(`/api/units/${id}`, {
        method: 'PUT',
        json: unit
      });
    },

    /**
     * Deletes a Unit
     *
     * NOT PAGINATED
     *
     * @param id
     */
    delete(id: string): Promise<IVeoAPIMessage> {
      return api.req(`/api/units/${id}`, {
        method: 'DELETE'
      });
    },

    /**
     * Fetches the incarnations for a group of catalog items
     */
    fetchIncarnations(itemIds: string | string[], unitId?: string) {
      if (!unitId) {
        unitId = api._context.route.params.unit;
      }

      if (isArray(itemIds)) {
        itemIds = itemIds.join(',');
      }

      return api.req(`/api/units/${unitId}/incarnations?itemIds=${itemIds}`);
    }
  };
}

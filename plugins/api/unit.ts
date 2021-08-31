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
    create(unit: Object): Promise<IVeoAPIMessage> {
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
    }
  };
}

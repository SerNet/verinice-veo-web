/*
 * verinice.veo web
 * Copyright (C) 2021  Philipp Ballhausen, Davit Svandize, Jonas Heitmann
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

import { IVeoAPIMessage } from '~/types/VeoTypes';
import { IVeoUnit } from '~~/composables/api/queryDefinitions/units';

export default function (api: Client) {
  return {
    /**
     * Loads all Units
     *
     * NOT PAGINATED
     *
     * @param parent
     */
    fetchAll(query?: Record<string, string>): Promise<IVeoUnit[]> {
      return api.req('/api/units', {
        query
      });
    },

    /**
     * Creates a Unit
     *
     * NOT PAGINATED
     *
     * @param unit
     */
    create(unit: object): Promise<IVeoAPIMessage> {
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
      return api.req('/api/units/:id', {
        params: {
          id
        }
      });
    },

    /**
     * Updates a Unit
     *
     * NOT PAGINATED
     *
     * @param id
     * @param unit
     */
    update(id: string, unit: object): Promise<IVeoUnit> {
      return api.req('/api/units/:id', {
        method: 'PUT',
        params: {
          id
        },
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
      return api.req('/api/units/:id', {
        method: 'DELETE',
        params: {
          id
        }
      });
    }
  
  };
}

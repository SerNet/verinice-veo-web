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
import { IVeoFormSchema, IVeoFormSchemaMeta } from '~/types/VeoTypes';

export default function (api: Client) {
  return {
    /**
     * Loads all Forms
     *
     * NOT PAGINATED
     *
     * @param parent
     */
    fetchAll(domain: string, query?: Record<string, string>): Promise<IVeoFormSchemaMeta[]> {
      if (!query) {
        query = {};
      }

      if (domain) {
        query.domainId = domain;
      }

      return api.req('/api/forms', {
        query
      });
    },

    /**
     * Creates a form
     *
     * NOT PAGINATED
     *
     * @param form
     * @returns UUID of the new form
     */
    create(domainId: string, form: IVeoFormSchema): Promise<string> {
      return api.req('/api/forms', {
        json: { domainId, ...form }
      });
    },

    /**
     * Loads a form by id
     *
     * NOT PAGINATED
     *
     * @param domainId The id of the domain to load the formschema for
     * @param id
     */
    async fetch(domainId: string, id: string): Promise<IVeoFormSchema> {
      const formSchema = await api.req('/api/forms/:id', {
        params: {
          id
        }
      });
      return JSON.parse(JSON.stringify(formSchema).replaceAll('{CURRENT_DOMAIN_ID}', domainId));
    },

    /**
     * Updates a form
     *
     * NOT PAGINATED
     *
     * @param id
     * @param form
     */
    update(id: string, domainId: string, form: IVeoFormSchema): Promise<void> {
      return api.req('/api/forms/:id', {
        method: 'PUT',
        params: {
          id
        },
        json: { domainId, ...form }
      });
    },

    /**
     * Deletes a form
     *
     * NOT PAGINATED
     *
     * @param id
     */
    delete(id: string): Promise<void> {
      return api.req('/api/forms/:id', {
        method: 'DELETE',
        params: {
          id
        }
      });
    }
  };
}

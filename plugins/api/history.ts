/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Jessica Lühnen
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
import { getSchemaEndpoint } from './schema';
import { Client } from '~/plugins/api';
import { IVeoEntity, IVeoObjectHistoryEntry } from '~/types/VeoTypes';

export default function (api: Client) {
  return {
    /**
     * Loads all versions for a given entity.
     *
     * NOT PAGINATED
     *
     * @param entity The entity to load the versions of.
     */
    async fetchVersions(entity: IVeoEntity, query?: Record<string, string>): Promise<IVeoObjectHistoryEntry[]> {
      if (!query) {
        query = {};
      }

      query.uri = `/${getSchemaEndpoint(await api._context.$api.schema.fetchAll(), entity.type)}/${entity.id}`;
      return api
        .req('/api/history/revisions', {
          query
        })
        .then((result: IVeoObjectHistoryEntry[]) => {
          result.forEach((historyEntry) => {
            if (!historyEntry.content.parts) {
              historyEntry.content.parts = [];
            }
            if (!historyEntry.content.members) {
              historyEntry.content.members = [];
            }
          });
          return result;
        });
    },

    /**
     * Loads the 10 latest edited objects/forms
     *
     * @param entity The entity to load the versions of.
     */
    fetchLatest(unitId: string, query?: Record<string, string>): Promise<IVeoObjectHistoryEntry[]> {
      if (!query) {
        query = {};
      }

      query.owner = `/units/${unitId}`;
      return api.req('/api/history/revisions/my-latest', {
        query
      });
    }
  };
}

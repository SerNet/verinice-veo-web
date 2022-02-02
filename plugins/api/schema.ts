/*
 * verinice.veo web
 * Copyright (C) 2021  Philipp Ballhausen, Davit Svandize, Jonas Heitmann, Samuel Vitzthum
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
import { IVeoObjectSchema } from '~/types/VeoTypes';

export interface IVeoEntityMetaInfo {
  collectionUri: string;
  searchUri: string;
  schemaUri: string;
}

export interface IVeoEntitiesMetaInfo {
  [key: string]: IVeoEntityMetaInfo;
}

export interface IVeoSchemaEndpoint {
  schemaName: string;
  endpoint: string;
}

let endpoints: IVeoSchemaEndpoint[];

export function getSchemaEndpoint(endpoints: IVeoSchemaEndpoint[], schemaName: string): string | undefined {
  return endpoints.find((endpoint) => endpoint.schemaName === schemaName)?.endpoint;
}

export function getSchemaName(endpoints: IVeoSchemaEndpoint[], _endpoint: string): string | undefined {
  return endpoints.find((endpoint) => endpoint.endpoint === _endpoint)?.schemaName;
}

export default function (api: Client) {
  return {
    /**
     * Returns an array of all entity schemas with their corresponding endpoint.
     *
     * NOT PAGINATED
     *
     */
    async fetchAll(ignoreMissingEndpoints: boolean = false, query?: Record<string, string>): Promise<IVeoSchemaEndpoint[]> {
      if (!endpoints) {
        const schemas: IVeoEntitiesMetaInfo = await api.req('/api/types', {
          query
        });

        const types = Object.keys(schemas);

        endpoints = types.map((type: string) => ({
          endpoint: schemas[type].collectionUri.split('/')[1].split('{')[0],
          schemaName: type
        }));
      }

      return endpoints.filter((entry) => ignoreMissingEndpoints || !!entry.endpoint);
    },

    /**
     * Retrieves an entity schema.
     *
     * NOT PAGINATED
     *
     * @param type
     * @param domainIds
     */
    // TODO: don't allow undefined to be passed since this is required by the API
    fetch(type: string, domainIds: string[] | undefined): Promise<IVeoObjectSchema> {
      return api.req('/api/schemas/:type', {
        params: {
          type
        },
        query: {
          domains: (domainIds || []).toString()
        }
      });
    }
  };
}

/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
import { max } from 'lodash';

import { getSchemaEndpoint } from './schema';
import { separateUUIDParam } from '~/lib/utils';
import { Client } from '~/plugins/api';
import { IVeoAPIMessage, IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions, IVeoRisk } from '~/types/VeoTypes';

export interface IVeoEntityRequestParams extends IVeoPaginationOptions {
  displayName?: string;
  subType?: string;
  unit?: string;
}

/**
 * This file replaces the individual files for each object schema (at the point
 * of the creation of this class asset, control, person, process) in order to
 * dynamically add new object types without modifying veo.web.
 *
 *
 * @param api Instance of the api client class used to communicate with the api endpoint.
 */
export default function (api: Client) {
  return {
    /**
     * Loads all Entities
     *
     * PAGINATED
     *
     * @param parent
     */
    async fetchAll(objectType: string, page: number = 0, query: IVeoEntityRequestParams = {}, noUnit: boolean = false): Promise<IVeoPaginatedResponse<IVeoEntity[]>> {
      // Entities don't get accessed without their unit as a context, for this reason we manually add the unit if omitted by the developer.
      // To override this behaviour, set noUnit to true.
      if (!query.unit && !noUnit) {
        query.unit = separateUUIDParam(api._context.params.unit).id;
      }

      // -1, because the first page for the api is 0, however vuetify expects it to be 1
      page = max([page - 1, 0]) || 0;
      query = { ...query, page };

      if (!query.size) {
        // if size is not set use the default user tablePageSize
        query.size = api._context.$user.tablePageSize;
      }

      if (query.size === -1) {
        // vuetify sets pageSite to "-1" if "all" is selected
        query.size = 1000;
      }

      objectType = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;
      return api
        .req('/api/:objectType', {
          params: {
            objectType
          },
          query
        })
        .then((result: IVeoPaginatedResponse<IVeoEntity[]>) => {
          result.items.forEach((entry: IVeoEntity) => {
            /*
             * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
             * members. However we combine both entity types as they get used more or less the same way
             */
            if (!entry.parts) {
              entry.parts = [];
            }
            if (!entry.members) {
              entry.members = [];
            }
            entry.displayName = `${entry.designator} ${entry.abbreviation || ''} ${entry.name}`;
          });

          // +1, because the first page for the api is 0, however vuetify expects it to be 1
          result.page = page + 1;
          return result;
        });
    },

    /**
     * Creates an entity
     * @param entity
     */
    async create(objectType: string, entity: IVeoEntity): Promise<IVeoAPIMessage> {
      objectType = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      // Remove properties of the object only used in the frontend
      if (entity.type === 'scopes') {
        // @ts-ignore
        delete entity.parts;
      } else {
        // @ts-ignore
        delete entity.members;
      }

      return api.req('/api/:objectType', {
        method: 'POST',
        params: {
          objectType
        },
        json: entity
      });
    },

    async createRisk(objectType: string, id: string, risk: IVeoRisk): Promise<IVeoEntity[]> {
      if (objectType !== 'process') {
        throw new Error(`api::fetchRisks: Risks can only be created for processes. You tried creating a risk for a ${objectType}`);
      }

      objectType = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      return api.req('/api/:objectType/:id/risks', {
        method: 'POST',
        params: {
          objectType,
          id
        },
        json: risk
      });
    },

    /**
     * Loads one entity by id
     * @param id
     */
    async fetch(objectType: string, id: string): Promise<IVeoEntity> {
      objectType = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      return api
        .req('/api/:objectType/:id', {
          params: {
            objectType,
            id
          }
        })
        .then((result: IVeoEntity) => {
          /*
           * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
           * members. However we combine both entity types as they get used more or less the same way
           */
          if (!result.parts) {
            result.parts = [];
          }
          if (!result.members) {
            result.members = [];
          }
          result.displayName = `${result.designator} ${result.abbreviation || ''} ${result.name}`;
          return result;
        });
    },

    async fetchRisks(objectType: string, id: string): Promise<IVeoEntity[]> {
      if (objectType !== 'process') {
        throw new Error(`api::fetchRisks: Risks can only be fetched for processes. You tried fetching a risk for a ${objectType}`);
      }

      objectType = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      return api.req('/api/:objectType/:id/risks', {
        params: {
          objectType,
          id
        }
      });
    },

    /**
     * Updates an entity
     * @param id
     * @param entity
     */
    async update(objectType: string, id: string, entity: IVeoEntity): Promise<IVeoEntity> {
      objectType = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      // Remove properties of the object only used in the frontend
      if (entity.type === 'scopes' || entity.type === 'scope') {
        // @ts-ignore
        delete entity.parts;
      } else {
        // @ts-ignore
        delete entity.members;
      }

      return api
        .req('/api/:objectType/:id', {
          method: 'PUT',
          json: entity,
          params: {
            objectType,
            id
          }
        })
        .then((result: IVeoEntity) => {
          /*
           * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
           * members. However we combine both entity types as they get used more or less the same way
           */
          if (!result.parts) {
            result.parts = [];
          }
          if (!result.members) {
            result.members = [];
          }
          result.displayName = `${result.designator} ${result.abbreviation || ''} ${result.name}`;
          return result;
        });
    },

    /**
     * Deletes an entity
     * @param id
     */
    async delete(objectType: string, id: string): Promise<IVeoAPIMessage> {
      objectType = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      return api.req('/api/:objectType/:id', {
        params: {
          objectType,
          id
        },
        method: 'DELETE'
      });
    },

    async deleteRisk(objectType: string, objectId: string, scenarioId: string): Promise<IVeoEntity[]> {
      if (objectType !== 'process') {
        throw new Error(`api::fetchRisks: Risks can only be deleted for processes. You tried deleting a risk for a ${objectType}`);
      }

      objectType = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      return api.req('/api/:objectType/:objectId/risks/:scenarioId', {
        method: 'DELETE',
        params: {
          objectType,
          objectId,
          scenarioId
        }
      });
    },

    /**
     * Returns all entities that are a sub entity of this entity.
     *
     * @param objectType The type to fetch the entities for.
     * @param id The uuid of the entity to fetch the sub entities for.
     */
    async fetchSubEntities(objectType: string, id: string): Promise<IVeoEntity[]> {
      objectType = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      if (objectType === 'scopes') {
        return api
          .req(`/api/scopes/:id/members`, {
            params: {
              id
            }
          })
          .then((result: IVeoEntity[]) => {
            result.forEach((entry: IVeoEntity) => {
              /*
               * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
               * members. However we combine both entity types as they get used more or less the same way
               */
              if (!entry.parts) {
                entry.parts = [];
              }
              if (!entry.members) {
                entry.members = [];
              }
              entry.displayName = `${entry.designator} ${entry.abbreviation || ''} ${entry.name}`;
            });
            return result;
          });
      } else {
        return api
          .req('/api/:objectType/:id/parts', {
            params: {
              objectType,
              id
            }
          })
          .then((result: IVeoEntity[]) => {
            result.forEach((entry: IVeoEntity) => {
              /*
               * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
               * members. However we combine both entity types as they get used more or less the same way
               */
              if (!entry.parts) {
                entry.parts = [];
              }
              if (!entry.members) {
                entry.members = [];
              }
              entry.displayName = `${entry.designator} ${entry.abbreviation || ''} ${entry.name}`;
            });
            return result;
          });
      }
    }
  };
}

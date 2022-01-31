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
import { IVeoAPIMessage, IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions } from '~/types/VeoTypes';

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
    async fetchAll(objectType: string, page: number = 0, params: IVeoEntityRequestParams = {}, noUnit: boolean = false): Promise<IVeoPaginatedResponse<IVeoEntity[]>> {
      // Entities don't get accessed without their unit as a context, for this reason we manually add the unit if omitted by the developer.
      // To override this behaviour, set noUnit to true.
      if (!params.unit && !noUnit) {
        params.unit = separateUUIDParam(api._context.params.unit).id;
      }

      // -1, because the first page for the api is 0, however vuetify expects it to be 1
      page = max([page - 1, 0]) || 0;

      params = { ...params, page };

      if (!params.size) {
        // if size is not set use the default user tablePageSize
        params.size = api._context.$user.tablePageSize;
      }

      if (params.size === -1) {
        // vuetify sets pageSite to "-1" if "all" is selected
        params.size = 1000;
      }

      const endpoint = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;
      return api
        .req(`/api/${endpoint}`, {
          params
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
      const endpoint = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      // Remove properties of the object only used in the frontend
      if (entity.type === 'scope') {
        // @ts-ignore
        delete entity.parts;
      } else {
        // @ts-ignore
        delete entity.members;
      }

      return api.req(`/api/${endpoint}`, {
        method: 'POST',
        json: entity
      });
    },

    /**
     * Loads one entity by id
     * @param id
     */
    async fetch(objectType: string, id: string): Promise<IVeoEntity> {
      const endpoint = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      return api.req(`/api/${endpoint}/${id}`).then((result: IVeoEntity) => {
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
     * Updates an entity
     * @param id
     * @param entity
     */
    async update(objectType: string, id: string, entity: IVeoEntity): Promise<IVeoEntity> {
      const endpoint = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      // Remove properties of the object only used in the frontend
      if (entity.type === 'scope') {
        // @ts-ignore
        delete entity.parts;
      } else {
        // @ts-ignore
        delete entity.members;
      }

      return api
        .req(`/api/${endpoint}/${id}`, {
          method: 'PUT',
          json: entity
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
      const endpoint = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      return api.req(`/api/${endpoint}/${id}`, {
        method: 'DELETE'
      });
    },

    /**
     * Returns all entities that are a sub entity of this entity.
     *
     * @param objectType The type to fetch the entities for.
     * @param id The uuid of the entity to fetch the sub entities for.
     */
    async fetchSubEntities(objectType: string, id: string): Promise<IVeoEntity[]> {
      const endpoint = getSchemaEndpoint(await api._context.$api.schema.fetchAll(), objectType) || objectType;

      if (objectType === 'scope') {
        return api.req(`/api/scopes/${id}/members`).then((result: IVeoEntity[]) => {
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
        return api.req(`/api/${endpoint}/${id}/parts`).then((result: IVeoEntity[]) => {
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

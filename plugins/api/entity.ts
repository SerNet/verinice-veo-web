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

import { separateUUIDParam } from '~/lib/utils';
import { Client } from '~/plugins/api';
import { IVeoAPIMessage, IVeoDecisionEvaluation, IVeoEntity, IVeoInspectionResult, IVeoPaginatedResponse, IVeoPaginationOptions, IVeoRisk } from '~/types/VeoTypes';

export interface IVeoEntityRequestParams extends IVeoPaginationOptions {
  displayName?: string;
  subType?: string;
  unit?: string;
  childElementIds?: string;
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
    fetchAll(endpoint: string, page = 1, query: IVeoEntityRequestParams = {}, noUnit = false): Promise<IVeoPaginatedResponse<IVeoEntity[]>> {
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
        query.size = api._user.tablePageSize.value;
      }

      if (query.size === -1) {
        // vuetify sets pageSite to "-1" if "all" is selected
        query.size = 1000;
      }

      return api
        .req('/api/:endpoint', {
          params: {
            endpoint
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
    create(endpoint: string, entity: IVeoEntity, parentScopes?: string[]): Promise<IVeoAPIMessage> {
      // Remove properties of the object only used in the frontend
      if (entity.type === 'scope') {
        // @ts-ignore Is only set in DTO if object is any type expect scope
        delete entity.parts;
      } else {
        // @ts-ignore Is only set in DTO if object is of type scope
        delete entity.members;
      }

      return api.req('/api/:endpoint', {
        method: 'POST',
        params: {
          endpoint
        },
        query: {
          scopes: parentScopes?.join(',')
        },
        json: entity
      });
    },

    createRisk(endpoint: string, id: string, risk: IVeoRisk): Promise<IVeoRisk> {
      if (endpoint !== 'processes') {
        throw new Error(`api::createRisk: Risks can only be created for processes. You tried creating a risk for a ${endpoint}`);
      }

      return api.req('/api/:endpoint/:id/risks', {
        method: 'POST',
        params: {
          endpoint,
          id
        },
        json: risk
      });
    },

    /**
     * Loads one entity by id
     * @param id
     */
    async fetch(endpoint: string, id: string): Promise<IVeoEntity> {
      const result = await api.req('/api/:endpoint/:id', {
        params: {
          endpoint,
          id
        }
      });

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
    },

    fetchRisks(endpoint: string, id: string): Promise<IVeoRisk[]> {
      if (endpoint !== 'processes') {
        throw new Error(`api::fetchRisk: Risks can only be fetched for processes. You tried fetching a risk for a ${endpoint}`);
      }

      return api.req('/api/:endpoint/:id/risks', {
        params: {
          endpoint,
          id
        }
      });
    },

    fetchInspections(endpoint: string, id: string, domain: string): Promise<IVeoInspectionResult[]> {
      return api.req('/api/:endpoint/:id/inspection', {
        params: {
          endpoint,
          id
        },
        query: {
          domain
        }
      });
    },

    fetchRisk(endpoint: string, id: string, scenarioId: string): Promise<IVeoRisk> {
      if (endpoint !== 'processes') {
        throw new Error(`api::fetchRisk: Risks can only be fetched for processes. You tried fetching a risk for a ${endpoint}`);
      }

      return api.req('/api/:endpoint/:id/risks/:scenarioId', {
        params: {
          endpoint,
          id,
          scenarioId
        }
      });
    },

    /**
     * Updates an entity
     * @param id
     * @param entity
     */
    async update(endpoint: string, id: string, entity: IVeoEntity): Promise<IVeoEntity> {
      // Remove properties of the object only used in the frontend
      if (entity.type === 'scope') {
        // @ts-ignore Is only set in DTO if object is any type expect scope
        delete entity.parts;
      } else {
        // @ts-ignore Is only set in DTO if object is of type scope
        delete entity.members;
      }

      // @ts-ignore Workaround for history: History has 9 digit second precision while default api only accepts 6 digit precision
      delete entity.createdAt;
      // @ts-ignore Workaround for history: History has 9 digit second precision while default api only accepts 6 digit precision
      delete entity.updatedAt;

      const result = await api.req('/api/:endpoint/:id', {
        method: 'PUT',
        json: entity,
        params: {
          endpoint,
          id
        }
      });

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
    },

    /**
     * Updates a risk
     * NOTE: CURRENTLY USES THE SAME ENDPOINT AS FOR POSTING AS THE PUTTING ENDPOINT IS INOP
     *
     * @param endpoint The endpoint of the object to update the risk for (currently has to be processes)
     * @param id The id of the process to update the risk for
     * @param _scenarioId Currently not used, see note
     * @param risk The new risk data
     * @returns Returns the updated risk
     */
    updateRisk(endpoint: string, id: string, _scenarioId: string, risk: IVeoRisk): Promise<IVeoRisk> {
      if (endpoint !== 'processes') {
        throw new Error(`api::updateRisk: Risks can only be created for processes. You tried updating a risk for a ${endpoint}`);
      }

      return api.req('/api/:endpoint/:id/risks', {
        method: 'POST',
        params: {
          endpoint,
          id
        },
        json: risk
      });
    },

    /**
     * Deletes an entity
     * @param id
     */
    delete(endpoint: string, id: string): Promise<IVeoAPIMessage> {
      return api.req('/api/:endpoint/:id', {
        params: {
          endpoint,
          id
        },
        method: 'DELETE'
      });
    },

    deleteRisk(endpoint: string, objectId: string, scenarioId: string): Promise<IVeoEntity[]> {
      if (endpoint !== 'processes') {
        throw new Error(`api::deleteRisk: Risks can only be deleted for processes. You tried deleting a risk for a ${endpoint}`);
      }

      return api.req('/api/:endpoint/:objectId/risks/:scenarioId', {
        method: 'DELETE',
        params: {
          endpoint,
          objectId,
          scenarioId
        }
      });
    },

    /**
     * Returns all entities that are a sub entity of this entity.
     *
     * @param endpoint The type to fetch the entities for.
     * @param id The uuid of the entity to fetch the sub entities for.
     */
    fetchSubEntities(endpoint: string, id: string): Promise<IVeoEntity[]> {
      if (endpoint === 'scopes') {
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
          .req('/api/:endpoint/:id/parts', {
            params: {
              endpoint,
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
    },
    /**
     * Get parent entities of this entities. Sadly only entities of one type get returned.
     *
     * @param parentType The type of the parent element(s)
     * @param id The id of the element to search for parents for
     * @returns a paginated response with all found parents
     */
    async fetchParents(parentType: string, id: string): Promise<IVeoPaginatedResponse<IVeoEntity[]>> {
      return await this.fetchAll(parentType, undefined, {
        childElementIds: id
      });
    },
    /**
     * Returns the same data as updating an object, however without persisting the data. Can be used to check whether the decision results would be different if the object is saved
     * @param endpoint
     * @param object
     * @returns
     */
    fetchWipDecisionEvaluation(endpoint: string, object: IVeoEntity, domain: string, decision: string): Promise<IVeoDecisionEvaluation> {
      return api.req('/api/:endpoint/evaluation', {
        method: 'POST',
        params: {
          endpoint
        },
        query: {
          domain,
          decision
        },
        json: object
      });
    }
  };
}

import { separateUUIDParam } from '~/lib/utils'
import { Client } from '~/plugins/api'
import { IVeoAPIMessage, IVeoEntity, IVeoLink } from '~/types/VeoTypes'
import { getSchemaEndpoint, getSchemaName } from './schema'

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
     * @param parent
     */
    fetchAll(objectType: string, params?: Record<string, string>, noUnit: boolean = false): Promise<IVeoEntity[]> {
      // Entities don't get accessed without their unit as a context, for this reason we manually add the unit if omitted by the developer.
      // To override this behaviour, set noUnit to true.
      if (!params || !params.unit) {
        params = { ...params, unit: separateUUIDParam(api._context.params.unit).id }
      }
      if (noUnit) {
        delete params.unit
      }

      const endpoint = getSchemaEndpoint(objectType) || objectType
      return api.req(`/api/${endpoint}`, {
        params
      }).then((result: IVeoEntity[]) => {
        result.forEach((entry: IVeoEntity) => {
          /*
          * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
          * members. However we combine both entity types as they get used more or less the same way
          */
          if (!entry.parts) {
            entry.parts = []
          }
          if (!entry.members) {
            entry.members = []
          }
        })
        return result
      })
    },

    /**
     * Creates an entity
     * @param entity
     */
    create(objectType: string, entity: IVeoEntity): Promise<IVeoAPIMessage> {
      const endpoint = getSchemaEndpoint(objectType) || objectType

      // Remove properties of the object only used in the frontend
      if (entity.type === 'scope') {
        // @ts-ignore
        delete entity.parts
      } else {
        // @ts-ignore
        delete entity.members
      }

      return api.req(`/api/${endpoint}`, {
        method: 'POST',
        json: entity
      })
    },

    /**
     * Loads one entity by id
     * @param id
     */
    fetch(objectType: string, id: string): Promise<IVeoEntity> {
      const endpoint = getSchemaEndpoint(objectType) || objectType

      return api.req(`/api/${endpoint}/${id}`).then((result: IVeoEntity) => {
        /*
         * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
         * members. However we combine both entity types as they get used more or less the same way
         */
        if (!result.parts) {
          result.parts = []
        }
        if (!result.members) {
          result.members = []
        }
        return result
      })
    },

    /**
     * Updates an entity
     * @param id
     * @param entity
     */
    update(objectType: string, id: string, entity: IVeoEntity): Promise<IVeoEntity> {
      const endpoint = getSchemaEndpoint(objectType) || objectType

      // Remove properties of the object only used in the frontend
      if (entity.type === 'scope') {
        // @ts-ignore
        delete entity.parts
      } else {
        // @ts-ignore
        delete entity.members
      }

      return api.req(`/api/${endpoint}/${id}`, {
        method: 'PUT',
        json: entity
      }).then((result: IVeoEntity) => {
        return result
      })
    },

    /**
     * Deletes an entity
     * @param id
     */
    delete(objectType: string, id: string): Promise<IVeoAPIMessage> {
      const endpoint = getSchemaEndpoint(objectType) || objectType

      return api.req(`/api/${endpoint}/${id}`, {
        method: 'DELETE'
      })
    },

    /**
     * Returns all entities that are a sub entity of this entity.
     * 
     * @param objectType The type to fetch the entities for.
     * @param id The uuid of the entity to fetch the sub entities for.
     */
    async fetchSubEntities(objectType: string, id: string): Promise<IVeoEntity[]> {
      const endpoint = getSchemaEndpoint(objectType) || objectType

      if (objectType === 'scope') {
        return api.req(`/api/scopes/${id}/members`).then((result: IVeoEntity[]) => {
          result.forEach((entry: IVeoEntity) => {
            /*
             * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
             * members. However we combine both entity types as they get used more or less the same way
             */
            if (!entry.parts) {
              entry.parts = []
            }
            if (!entry.members) {
              entry.members = []
            }
          })
          return result
        })

      } else {
        return api.req(`/api/${endpoint}/${id}/parts`).then((result: IVeoEntity[]) => {
          result.forEach((entry: IVeoEntity) => {
            /*
             * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
             * members. However we combine both entity types as they get used more or less the same way
             */
            if (!entry.parts) {
              entry.parts = []
            }
            if (!entry.members) {
              entry.members = []
            }
          })
          return result
        })
      }
    }
  }
}

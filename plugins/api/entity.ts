import { separateUUIDParam } from '~/lib/utils'
import { Client } from '~/plugins/api'
import { IVeoAPIMessage, IVeoEntity } from '~/types/VeoTypes'
import { getSchemaEndpoint } from './schema'

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

      // we transform the object type to lowercase, as we refer to the TECHNICAL id, which is ALWAYS lowercase
      const endpoint = (getSchemaEndpoint(objectType.toLowerCase()) || objectType).toLowerCase()
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
          entry.displayName = `${entry.abbreviation} ${entry.name}`
        })
        return result
      })
    },

    /**
     * Creates an entity
     * @param entity
     */
    create(objectType: string, entity: IVeoEntity): Promise<IVeoAPIMessage> {
      // we transform the object type to lowercase, as we refer to the TECHNICAL id, which is ALWAYS lowercase
      const endpoint = (getSchemaEndpoint(objectType.toLowerCase()) || objectType).toLowerCase()

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
      // we transform the object type to lowercase, as we refer to the TECHNICAL id, which is ALWAYS lowercase
      const endpoint = (getSchemaEndpoint(objectType.toLowerCase()) || objectType).toLowerCase()

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
        result.displayName = `${result.abbreviation} ${result.name}`
        return result
      })
    },

    /**
     * Updates an entity
     * @param id
     * @param entity
     */
    update(objectType: string, id: string, entity: IVeoEntity): Promise<IVeoEntity> {
      // we transform the object type to lowercase, as we refer to the TECHNICAL id, which is ALWAYS lowercase
      const endpoint = (getSchemaEndpoint(objectType.toLowerCase()) || objectType).toLowerCase()

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
      // we transform the object type to lowercase, as we refer to the TECHNICAL id, which is ALWAYS lowercase
      const endpoint = (getSchemaEndpoint(objectType.toLowerCase()) || objectType).toLowerCase()

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
      // we transform the object type to lowercase, as we refer to the TECHNICAL id, which is ALWAYS lowercase
      const endpoint = (getSchemaEndpoint(objectType.toLowerCase()) || objectType).toLowerCase()

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
            entry.displayName = `${entry.abbreviation} ${entry.name}`
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
            entry.displayName = `${entry.abbreviation} ${entry.name}`
          })
          return result
        })
      }
    }
  }
}

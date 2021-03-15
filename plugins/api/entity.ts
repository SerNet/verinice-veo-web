import { Client } from '~/plugins/api'
import { IVeoAPIMessage, IVeoEntity } from '~/types/VeoTypes'

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
    fetchAll(objectType: string, params?: Record<string, string>): Promise<IVeoEntity[]> {
      return api.req(`/api/${objectType}`, {
        params
      }).then((result: IVeoEntity[]) => {
        result.forEach((entry: IVeoEntity) => {
          Object.defineProperty(entry, '$type', { enumerable: false, configurable: false, value: objectType })
        })
        return result
      })
    },

    /**
     * Creates an entity
     * @param entity
     */
    create(objectType: string, entity: IVeoEntity): Promise<IVeoAPIMessage> {
      return api.req(`/api/${objectType}`, {
        method: 'POST',
        json: entity
      })
    },

    /**
     * Loads one entity by id
     * @param id
     */
    fetch(objectType: string, id: string): Promise<IVeoEntity> {
      return api.req(`/api/${objectType}/${id}`).then((result: IVeoEntity) => {
        Object.defineProperty(result, '$type', { enumerable: false, configurable: false, value: objectType })
        return result
      })
    },

    /**
     * Updates an entity
     * @param id
     * @param entity
     */
    update(objectType: string, id: string, entity: IVeoEntity): Promise<IVeoEntity> {
      return api.req(`/api/${objectType}/${id}`, {
        method: 'PUT',
        json: entity
      }).then((result: IVeoEntity) => {
        Object.defineProperty(result, '$type', { enumerable: false, configurable: false, value: objectType })
        return result
      })
    },

    /**
     * Deletes an entity
     * @param id
     */
    delete(objectType: string, id: string): Promise<IVeoAPIMessage> {
      return api.req(`/api/${objectType}/${id}`, {
        method: 'DELETE'
      })
    },

    /**
     * Returns all entities that are a sub entity of this entity.
     * 
     * @param objectType The type to fetch the entities for.
     * @param id The uuid of the entity to fetch the sub entities for.
     */
    fetchSubEntities(objectType: string, id: string): Promise<IVeoEntity[]> {
      return api.req(`/api/${objectType}/${id}/parts`).then((result: IVeoEntity[]) => {
        result.forEach((entry: IVeoEntity) => {
          Object.defineProperty(entry, '$type', { enumerable: false, configurable: false, value: objectType })
        })
        return result
      })
    }
  }
}

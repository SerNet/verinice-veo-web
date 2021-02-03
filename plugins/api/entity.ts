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
export default function(api: Client) {
  return {
    /**
     * Loads all Persons
     * @param parent
     */
    fetchAll(objectType: string, params?: Record<string, string>): Promise<IVeoEntity[]> {
      return api.req(`/api/${objectType}`, {
        params
      })
    },

    /**
     * Creates a person
     * @param person
     */
    create(objectType: string, person: Object): Promise<IVeoAPIMessage> {
      return api.req(`/api/${objectType}`, {
        method: 'POST',
        json: person
      })
    },

    /**
     * Loads one Person by id
     * @param id
     */
    fetch(objectType: string, id: string): Promise<IVeoEntity> {
      return api.req(`/api/${objectType}/${id}`)
    },

    /**
     * Updates a person
     * @param id
     * @param person
     */
    update(objectType: string, id: string, person: Object): Promise<IVeoEntity> {
      return api.req(`/api/${objectType}/${id}`, {
        method: 'PUT',
        json: person
      })
    },

    /**
     * Deletes a person
     * @param id
     */
    delete(objectType: string, id: string): Promise<IVeoAPIMessage> {
      return api.req(`/api/${objectType}/${id}`, {
        method: 'DELETE'
      })
    }
  }
}

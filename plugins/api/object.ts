import { Client } from '~/plugins/api'

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
    fetchAll(objectType: string, params?: Record<string, string>) {
      return api.req(`/api/${objectType}`, {
        params
      })
    },

    /**
     * Creates a person
     * @param person
     */
    create(objectType: string, person: Object) {
      return api.req(`/api/${objectType}`, {
        json: person
      })
    },

    /**
     * Loads one Person by id
     * @param id
     */
    fetch(objectType: string, id: string) {
      return api.req(`/api/${objectType}/${id}`)
    },

    /**
     * Updates a person
     * @param id
     * @param person
     */
    update(objectType: string, id: string, person: Object) {
      return api.req(`/api/${objectType}/${id}`, {
        method: 'PUT',
        json: person
      })
    },

    /**
     * Deletes a person
     * @param id
     */
    delete(objectType: string, id: string) {
      return api.req(`/api/${objectType}/${id}`, {
        method: 'DELETE'
      })
    }
  }
}

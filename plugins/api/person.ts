import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    /**
     * Loads all Persons
     * @param parent
     */
    fetchAll(parent?: string) {
      return api.req('/api/persons', {
        params: { parent }
      })
    },

    /**
     * Creates a person
     * @param person
     */
    create(person: Object) {
      api.req('/api/persons', {
        json: person
      })
    },

    /**
     * Loads one Person by id
     * @param id
     */
    fetch(id: string) {
      return api.req(`/api/persons/${id}`)
    },

    /**
     * Updates a person
     * @param id
     * @param person
     */
    update(id: string, person: Object) {
      return api.req(`/api/persons/${id}`, {
        method: 'PUT',
        json: person
      })
    },

    /**
     * Deletes a person
     * @param id
     */
    delete(id: string) {
      return api.req(`/api/persons/${id}`, {
        method: 'DELETE'
      })
    }
  }
}

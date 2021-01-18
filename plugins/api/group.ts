import { Client } from '~/plugins/api'

export default function(api: Client) {
  return {
    /**
     * Loads all Groups
     * @param parent
     * @param type
     */
    fetchAll(params?: Record<string, string>) {
      return api.req('/api/groups', {
        params
      })
    },

    /**
     * Creates a group
     * @param group
     */
    create(group: Object) {
      return api.req('/api/groups', {
        json: group
      })
    },

    /**
     * Loads one Group by id
     * @param id
     * @param type
     */
    fetch(id: string, type: string) {
      return api.req(`/api/groups/${id}`, {
        params: { type }
      })
    },

    /**
     * Updates a group
     * @param id
     * @param type
     * @param group
     */
    update(id: string, type: string, group: Object) {
      return api.req(`/api/groups/${id}`, {
        method: 'PUT',
        params: { type },
        json: group
      })
    },

    /**
     * Deletes a group
     * @param id
     * @param type
     */
    delete(id: string, type: string) {
      return api.req(`/api/groups/${id}`, {
        method: 'DELETE',
        params: { type }
      })
    },

    /**
     * Loads the members of a group
     * @param id
     * @param type
     */
    fetchGroupMembers(id: string, type: string) {
      return api.req(`/api/groups/${id}/members`, {
        params: { type }
      })
    }
  }
}

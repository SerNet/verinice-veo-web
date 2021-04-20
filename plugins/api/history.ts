import { Client } from '~/plugins/api'
import { IVeoEntity, IVeoFormSchemaMeta } from '~/types/VeoTypes'
import { getSchemaEndpoint } from './schema'

export default function (api: Client) {
  return {
    /**
     * Loads all versions for a given entity.
     * 
     * @param entity The entity to load the versions of.
     */
    fetchVersions(entity: IVeoEntity, params?: Record<string, string>): Promise<IVeoFormSchemaMeta[]> {
      if (!params) {
        params = {}
      }
      console.log(entity)

      params.url = `${getSchemaEndpoint(entity.type)}/${entity.id}`
      return api.req('/api/history/revisions/', {
        params
      })
    },

    /**
     * Loads a specific version of a given entity.
     * 
     * @param entity The entity to load the version of.
     * @param version The version of the entity to load.
     */
    fetchVersion(entity: IVeoEntity, version: string, params?: Record<string, string>): Promise<IVeoFormSchemaMeta[]> {
      return api.req(`/api/history/revisions/version/${version}`, {
        params
      })
    },

    /**
     * Loads the newest version of the given entity at a point in time.
     * 
     * @param entity The entity to load the version of.
     * @param date The date at which to retrieve the most current version.
     */
    fetchVersionAt(entity: IVeoEntity, date: string, params?: Record<string, string>): Promise<IVeoFormSchemaMeta[]> {
      return api.req(`/api/history/revisions/contemporary/${date}`, {
        params
      })
    }
  }
}

import { getSchemaEndpoint } from './schema';
import { Client } from '~/plugins/api';
import { IVeoEntity, IVeoObjectHistoryEntry } from '~/types/VeoTypes';

export default function (api: Client) {
  return {
    /**
     * Loads all versions for a given entity.
     *
     * NOT PAGINATED
     *
     * @param entity The entity to load the versions of.
     */
    fetchVersions(entity: IVeoEntity, params?: Record<string, string>): Promise<IVeoObjectHistoryEntry[]> {
      if (!params) {
        params = {};
      }

      params.uri = `/${getSchemaEndpoint(entity.type)}/${entity.id}`;
      return api.req('/api/history/revisions/', {
        params
      });
    },

    /**
     * Loads a specific version of a given entity.
     *
     * NOT PAGINATED
     *
     * @param entity The entity to load the version of.
     * @param changeNumber The version of the entity to load.
     */
    fetchVersion(entity: IVeoEntity, changeNumber: string, params?: Record<string, string>): Promise<IVeoObjectHistoryEntry> {
      if (!params) {
        params = {};
      }

      params.uri = `/${getSchemaEndpoint(entity.type)}/${entity.id}`;
      return api.req(`/api/history/revisions/change/${changeNumber}`, {
        params
      });
    },

    /**
     * Loads the newest version of the given entity at a point in time.
     *
     * NOT PAGINATED
     *
     * @param entity The entity to load the version of.
     * @param date The date at which to retrieve the most current version.
     */
    fetchVersionAt(entity: IVeoEntity, date: string, params?: Record<string, string>): Promise<IVeoObjectHistoryEntry> {
      if (!params) {
        params = {};
      }

      params.uri = `/${getSchemaEndpoint(entity.type)}/${entity.id}`;
      return api.req(`/api/history/revisions/contemporary/${date}`, {
        params
      });
    }
  };
}

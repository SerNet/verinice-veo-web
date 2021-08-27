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
    async fetchVersions(entity: IVeoEntity, params?: Record<string, string>): Promise<IVeoObjectHistoryEntry[]> {
      if (!params) {
        params = {};
      }

      params.uri = `/${getSchemaEndpoint(await api._context.$api.schema.fetchAll(), entity.type)}/${entity.id}`;
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
    async fetchVersion(entity: IVeoEntity, changeNumber: string, params?: Record<string, string>): Promise<IVeoObjectHistoryEntry> {
      if (!params) {
        params = {};
      }

      params.uri = `/${getSchemaEndpoint(await api._context.$api.schema.fetchAll(), entity.type)}/${entity.id}`;
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
    async fetchVersionAt(entity: IVeoEntity, date: string, params?: Record<string, string>): Promise<IVeoObjectHistoryEntry> {
      if (!params) {
        params = {};
      }

      params.uri = `/${getSchemaEndpoint(await api._context.$api.schema.fetchAll(), entity.type)}/${entity.id}`;
      return api.req(`/api/history/revisions/contemporary/${date}`, {
        params
      });
    },

    /**
     * Loads the 10 latest edited objects/forms
     *
     * @param entity The entity to load the versions of.
     */
    fetchLatest(unitId: string, params?: Record<string, string>): Promise<IVeoObjectHistoryEntry[]> {
      if (!params) {
        params = {};
      }

      params.owner = `/units/${unitId}`;
      return api.req('/api/history/revisions/my-latest/', {
        params
      });
    }
  };
}

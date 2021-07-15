import { Client } from '~/plugins/api';
import { IVeoObjectSchema } from '~/types/VeoTypes';

export interface IVeoEntityMetaInfo {
  collectionUri: string;
  searchUri: string;
  schemaUri: string;
}

export interface IVeoEntitiesMetaInfo {
  [key: string]: IVeoEntityMetaInfo;
}

export interface IVeoSchemaEndpoint {
  schemaName: string;
  endpoint: string;
}

let endpoints: IVeoSchemaEndpoint[];

/**
 * Schemas in this array usually get handled differently than "normal" schemas. While we don't treat them differently in
 * this file, other files in the project might refer to this array
 */
export const nonLinkableSchemas = ['scope'];

export default function (api: Client) {
  return {
    /**
     * Returns an array of all entity schemas with their corresponding endpoint.
     *
     * NOT PAGINATED
     *
     */
    async fetchAll(ignoreMissingEndpoints: boolean = false, params?: Record<string, string>): Promise<IVeoSchemaEndpoint[]> {
      if (!endpoints) {
        const schemas: IVeoEntitiesMetaInfo = await api.req('/api/types', {
          params
        });

        const types = Object.keys(schemas);

        endpoints = types.map((type: string) => ({
          endpoint: schemas[type].schemaUri,
          schemaName: type
        }));
      }

      return endpoints.filter((entry) => ignoreMissingEndpoints || !!entry.endpoint);
    },

    /**
     * Retrieves an entity schema.
     *
     * NOT PAGINATED
     *
     * @param type
     */
    fetch(type: string): Promise<IVeoObjectSchema> {
      return api.req(`/api/schemas/${type}`, {
        params: {
          domains: 'GDPR,ISO_27001'
        }
      });
    }
  };
}

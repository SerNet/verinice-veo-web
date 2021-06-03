import { Client } from '~/plugins/api';
import { IVeoObjectSchema } from '~/types/VeoTypes';

export interface ISchemaEndpoint {
  schemaName: string;
  endpoint: string;
}

// The key might be different to the title of the object schema defined in its title property. However this key
// should be seen as a technical id and is ALWAYS lowercase
export const endpoints = {
  asset: 'assets',
  control: 'controls',
  document: 'documents',
  incident: 'incidents',
  person: 'persons',
  process: 'processes',
  scenario: 'scenarios',
  scope: 'scopes'
};

/**
 * Schemas in this array usually get handled differently than "normal" schemas. While we don't treat them differently in
 * this file, other files in the project might refer to this array
 */
export const nonLinkableSchemas = ['scope'];

export function getSchemaName(endpoint: string): string | undefined {
  for (const key of Object.keys(endpoints)) {
    // @ts-ignore
    if (endpoints[key] === endpoint) {
      return key;
    }
  }

  return undefined;
}

export function getSchemaEndpoint(schemaName: string): string | undefined {
  // @ts-ignore
  return endpoints[schemaName];
}

export default function (api: Client) {
  return {
    /**
     * Returns an array of all entity schemas with their corresponding endpoint.
     */
    async fetchAll(ignoreMissingEndpoints: boolean = false, params?: Record<string, string>): Promise<ISchemaEndpoint[]> {
      const schemas: { knownSchemas: string[] } = await api.req('/api/schemas', {
        params
      });
      return schemas.knownSchemas
        .map((schema) => ({
          schemaName: schema,
          // @ts-ignore
          endpoint: endpoints[schema]
        }))
        .filter((entry) => ignoreMissingEndpoints || !!entry.endpoint);
    },

    /**
     * Retrieves an entity schema.
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

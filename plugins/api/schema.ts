import { Client } from '~/plugins/api'
import { IVeoObjectSchema } from '~/types/VeoTypes'

export interface ISchemaEndpoint {
  schemaName: string
  endpoint: string
}

export const endpoints = {
  asset: 'assets',
  control: 'controls',
  document: 'documents',
  incident: 'incidents',
  person: 'persons',
  process: 'processes',
  scenario: 'scenarios',
  scope: 'scopes'
}

/**
 * Schemas in this array usually get handled differently than "normal" schemas. While we don't treat them differently in
 * this file, other files in the project might refer to this array
 */
export const nonLinkableSchemas = ['scope']

export function getSchemaName(endpoint: string): string | undefined {
  for (let key of Object.keys(endpoints)) {
    // @ts-ignore
    if (endpoints[key] === endpoint) {
      return key
    }
  }

  return undefined
}

export function getSchemaEndpoint(schemaName: string): string | undefined {
  // @ts-ignore
  return endpoints[schemaName]
}

export default function (api: Client) {
  return {
    /**
     * Returns an array of all entity schemas with their corresponding endpoint.
     */
    fetchAll(ignoreMissingEndpoints: boolean = false, params?: Record<string, string>): Promise<ISchemaEndpoint[]> {
      return api.req('/api/schemas', {
        params
      }).then((data: { knownSchemas: string[] }) => data.knownSchemas.map(schema => ({
        schemaName: schema,
        // @ts-ignore
        endpoint: endpoints[schema]
      })).filter(entry => ignoreMissingEndpoints || !!entry.endpoint))
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
      })
    }
  }
}

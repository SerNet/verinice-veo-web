import { Client } from '~/plugins/api'

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
}

export function getSchemaName(endpoint: string): string | undefined {
  for (let key of Object.keys(endpoints)) {
    // @ts-ignore
    if(endpoints[key] === endpoint) {
      return key
    }
  }

  return undefined
}

export function getSchemaEndpoint(schemaName: string): string | undefined {
  // @ts-ignore
  return endpoints[schemaName]
}

export default function(api: Client) {
  return {
    /**
     * Returns an array of all entity schemas with their corresponding endpoint.
     */
    fetchAll(): Promise<ISchemaEndpoint[]> {
      return api.req('/api/schemas').then((data: { knownSchemas: string[] })=> data.knownSchemas.map(schema => ({
        schemaName: schema,
        // @ts-ignore
        endpoint: endpoints[schema]
      })).filter(entry => !!entry.endpoint))
    },

    /**
     * Retrieves an entity schema.
     * @param type
     */
    fetch(type: string) {
      return api.req(`/api/schemas/${type}`, {
        params: {
          domains: 'GDPR,ISO_27001'
        }
      })
    }
  }
}

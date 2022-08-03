/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann, Samuel Vitzthum
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Client } from '~/plugins/api';
import { IVeoDomain, IVeoObjectSchema, IVeoUnit } from '~/types/VeoTypes';

export interface IVeoDomainStatusCount {
  [objectSchema: string]: {
    [subType: string]: {
      [status: string]: number;
    };
  };
}

export default function (api: Client) {
  return {
    /**
     * Loads all domains
     *
     * WARNING: Usually you want to use fetchUnitDomains instead
     *
     * @param query Additional request query params
     */
    fetchAll(query?: Record<string, string>): Promise<IVeoDomain[]> {
      return api.req('/api/domains/', {
        query
      });
    },

    /**
     * Load all domains belonging to a certain unit
     *
     * @param unitId Id of the unit to load the domains for
     * @param query Additional request query params
     */
    async fetchUnitDomains(unitId: string, query?: Record<string, string>): Promise<IVeoDomain[]> {
      // @ts-ignore
      const unit: IVeoUnit = await api.unit.fetch(unitId);
      const domains: IVeoDomain[] = await this.fetchAll(query);

      // Only return domains that are present in the current unit
      return domains.filter((domain) => unit.domains.some((unitDomain) => unitDomain.targetUri.includes(domain.id)));
    },

    /**
     * Loads a domain by its uuid
     *
     * @param query Additional request query params
     */
    fetch(id: string, query?: Record<string, string>): Promise<IVeoDomain> {
      return api.req('/api/domains/:id', {
        params: {
          id
        },
        query
      });
    },

    /**
     * Update a type definition (object schema) in a domain
     * @param id domain ID
     * @param objectType object type
     * @param data object schema
     * @returns void
     */
    updateTypeDefinition(id: string, objectType: string, data: IVeoObjectSchema): Promise<void> {
      return api.req(`/api/domains/:id/elementtypedefinitions/:type/updatefromobjectschema`, {
        method: 'POST',
        params: {
          id,
          type: objectType
        },
        json: data
      });
    },

    /**
     * Returns all sub types, their statuses and the object count with those properties for every object schema for this domain.
     * @param domainId domain ID
     */
    inspectDomainObjects(unitId: string, domainId: string): Promise<IVeoDomainStatusCount> {
      return api.req(`/api/domains/:id/element-status-count`, {
        method: 'GET',
        params: {
          id: domainId
        },
        query: {
          unit: unitId
        }
      });
    }
  };
}

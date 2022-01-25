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

export default function (api: Client) {
  return {
    /**
     * Loads all domains
     *
     * @param params Additional request params
     */
    fetchAll(params?: Record<string, string>): Promise<IVeoDomain[]> {
      return api.req('/api/domains/', {
        params
      });
    },

    /**
     * Load all domains belonging to a certain unit
     *
     * @param unitId Id of the unit to load the domains for
     * @param params Additional request params
     */
    async fetchUnitDomains(unitId: string, params?: Record<string, string>): Promise<IVeoDomain[]> {
      // @ts-ignore
      const unit: IVeoUnit = await api.unit.fetch(unitId);
      const domains: IVeoDomain[] = await this.fetchAll(params);

      // Only return domains that are present in the current unit
      return domains.filter((domain) => unit.domains.some((unitDomain) => unitDomain.targetUri.includes(domain.id)));
    },

    /**
     * Loads a domain by its uuid
     *
     * @param params Additional request params
     */
    fetch(id: string, params?: Record<string, string>): Promise<IVeoDomain> {
      return api.req(`/api/domains/${id}`, {
        params
      });
    },

    /**
     * Update a type definition (object schema) in a domain
     * @param id domain ID
     * @param objectType object type
     * @param data object schema
     * @returns ?
     */
    updateTypeDefinition(id: string, objectType: string, data: IVeoObjectSchema): Promise<unknown> {
      return api.req(`/api/domains/${id}/elementtypedefinitions/${objectType}/updatefromobjectschema`, {
        method: 'POST',
        json: data
      });
    }
  };
}

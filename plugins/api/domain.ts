import { Client } from '~/plugins/api';
import { IVeoDomain, IVeoUnit } from '~/types/VeoTypes';

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
    }
  };
}

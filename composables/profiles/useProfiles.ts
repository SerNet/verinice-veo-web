/*
 * verinice.veo web
 * Copyright (C) 2024 jae
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

import { useQuerySync } from '~/composables/api/utils/query';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import type { TVeoDomain } from '~/composables/domains/useDomains';

// API returns IVeoAPIProfile[]
interface IVeoAPIProfile {
  id: string;
  name: string;
  description: string;
  language: string;
}

interface IVeoProfilesPerDomain {
  domainName: string;
  domainId: string;
  profiles: IVeoAPIProfile[];
}

// Internally this FE uses:
export interface TVeoProfile {
  name: string;
  description: string;
  language: string;
  id: string;
  domainName: string;
  domainId: string;
  raw: IVeoAPIProfile;
}

export function useProfiles() {
  const { domains } = useDomains();
  const profiles = ref<TVeoProfile[]>([]);
  const isLoading = ref(true);

  // Fetch all profiles from all available domains
  async function getProfiles({ domains }: { domains: TVeoDomain[] }): Promise<IVeoProfilesPerDomain[]> {
    if (!domains) return [];

    //return await Promise.all(
    return await Promise.all(
      domains.map(async (domain) => {
        const profiles = await useQuerySync(domainQueryDefinitions.queries.fetchProfiles, { domainId: domain.id });
        // The API does not return information on domainName, id etc.
        // This is why fetched profile data needs to be enhanced:
        return { domainName: domain.name, domainId: domain.id, profiles };
      })
    );
  }

  watch(domains, async () => {
    // Clone domains, because they are readonly
    const _domains = JSON.parse(JSON.stringify(domains.value));
    const profilesPerDomain = await getProfiles({ domains: _domains });
    profiles.value = map(profilesPerDomain);
    isLoading.value = false;
  });

  return {
    profiles,
    isLoading
  };
}

// Transform data into a structure which can be used in SFCs
function map(profilesPerDomain: IVeoProfilesPerDomain[]): TVeoProfile[] {
  return profilesPerDomain
    .map((domain) =>
      domain?.profiles.map((profile) => ({
        ...profile,
        domainName: domain.domainName,
        domainId: domain.domainId,
        raw: profile
      }))
    )
    .flat();
}

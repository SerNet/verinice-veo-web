/*
 * verinice.veo web
 * Copyright (C) 2024 jae
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by

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

import { useQuery } from 'vue-query-v5';
import { read } from '~/requests/crud';
import { config as baseConfig } from '~/configuration/base/config';
import { customKebabCase } from '~/composables/useConfiguration';

import type { IVeoDomain, IVeoDomainTranslations } from '~/composables/api/queryDefinitions/domains';
import type { IVeoDomainRiskDefinition } from '~/types/VeoTypes';

export type TVeoDomain = {
  name: string;
  id: string;
  riskDefinitions: { [key: string]: IVeoDomainRiskDefinition };
  complianceControlSubTypes: string[];
  color: string;
  raw: IVeoDomain;
  translations: IVeoDomainTranslations;
};

export function useCurrentDomain() {
  const domainId = computed(() => useRoute().params.domain);
  const queryKey = ['domains', { domainId }];
  const enabled = computed(() => !!domainId.value);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: ({ queryKey }) => {
      const { domainId } = queryKey[1] as { domainId: string };
      const path = `/domains/${domainId}`;
      return domainId ? read({ path }) : Promise.reject('no domain id');
    },
    enabled
  });

  const currentDomain = computed(() => {
    if (!data.value) return;
    return map([data.value])[0];
  });

  return {
    data: currentDomain,
    isLoading,
    isFetching,
    error
  };
}

export function useDomains() {
  const queryKey = ['domains'];
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: () => {
      const path = '/domains';
      return read({ path });
    }
  });

  const domains = computed(() => {
    if (!data.value) return [];
    return map(data.value);
  });

  return {
    data: domains,
    isLoading,
    isFetching,
    error
  };
}

export function useDomainColor(domainName: string): string {
  if (!domainName) return baseConfig.domains.colors.default;
  return baseConfig.domains.colors[customKebabCase(domainName)];
}

function map(domains: IVeoDomain[]): TVeoDomain[] {
  return domains.map((domain) => ({
    name: domain.name,
    id: domain.id,
    riskDefinitions: domain.riskDefinitions,
    complianceControlSubTypes: domain.controlImplementationConfiguration?.complianceControlSubTypes || [],
    color: useDomainColor(domain?.name),
    raw: domain,
    translations: domain.translations
  }));
}

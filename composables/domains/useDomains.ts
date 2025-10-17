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

import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import { useQuerySync } from '~/composables/api/utils/query';
import { customKebabCase } from '~/composables/useConfiguration';
import { config as baseConfig } from '~/configuration/base/config';

import type { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
import type { IVeoDomainRiskDefinition } from '~/types/VeoTypes';

export type TVeoDomain = {
  name: string;
  id: string;
  abbreviation: string;
  description: string;
  riskDefinitions: { [key: string]: IVeoDomainRiskDefinition };
  complianceControlSubTypes: string[];
  color: string;
  raw: IVeoDomain;
};

export function useCurrentDomain() {
  const data = ref<TVeoDomain | undefined>();
  const isLoading = ref<boolean>(true);
  const error = ref<Error | null>(null);
  const route = useRoute();

  async function getDomain() {
    try {
      isLoading.value = true;
      const result = await useQuerySync(domainQueryDefinitions.queries.fetchDomain, {
        id: route.params.domain as string
      });
      if (result) {
        data.value = {
          name: result.name,
          abbreviation: result.abbreviation,
          riskDefinitions: result.riskDefinitions,
          id: result.id,
          description: result.description,
          complianceControlSubTypes: result.controlImplementationConfiguration?.complianceControlSubTypes || [],
          color: useDomainColor(result.name)!,
          raw: result
        };
      }
    } catch (e: any) {
      console.error('Error fetching domain:', e);
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }

  if (route.params.domain) getDomain();

  watch(
    () => route.params.domain,
    () => {
      if (route.params.domain) getDomain();
    }
  );

  return {
    data,
    isLoading,
    error,
    refresh: getDomain
  };
}

export function useDomains() {
  const data = ref<TVeoDomain[]>([]);
  const isLoading = ref<boolean>(true);
  const error = ref<Error | null>(null);

  async function getDomains() {
    try {
      isLoading.value = true;
      const result = await useQuerySync(domainQueryDefinitions.queries.fetchDomains);
      data.value = map(result);
    } catch (e: any) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }

  getDomains();

  return {
    data,
    isLoading,
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
    abbreviation: domain.abbreviation,
    id: domain.id,
    riskDefinitions: domain.riskDefinitions,
    complianceControlSubTypes: domain.controlImplementationConfiguration?.complianceControlSubTypes || [],
    description: domain.description,
    color: useDomainColor(domain?.name),
    raw: domain
  }));
}

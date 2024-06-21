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

import { useQuerySync } from '~/composables/api/utils/query';
import domainQueryDefinitions from '~/composables/api/queryDefinitions/domains';
import type { IVeoDomain } from '~/composables/api/queryDefinitions/domains';

export type TVeoDomain = {
  name: string;
  id: string;
  abbreviation: string;
  description: string;
  color: string;
  raw: IVeoDomain;
};

export enum Colors {
  ITGS = 'green',
  DSGVO = 'primary',
  NIS2 = 'purple',
  DEFAULT = ''
}

export function useCurrentDomain() {
  const data = ref<TVeoDomain | undefined>();
  const route = useRoute();
  async function getDomain() {
    try {
      const result = await useQuerySync(domainQueryDefinitions.queries.fetchDomain, {
        id: route.params.domain as string
      });
      if (result) {
        data.value = {
          name: result.name,
          abbreviation: result.abbreviation,
          id: result.id,
          description: result.description,
          color: getColorByDomainName(result.name)!,
          raw: result
        };
      }
    } catch (error) {
      console.error('Error fetching domain:', error);
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
    currentDomain: readonly(data),
    currentDomainName: data.value?.name
  };
}

export function useDomains() {
  const data = ref<TVeoDomain[]>([]);
  const isLoading = ref<boolean>(true);
  const error = ref<Error | null>(null);

  async function getDomains() {
    const result = await useQuerySync(domainQueryDefinitions.queries.fetchDomains);
    data.value = map(result);
  }

  getDomains();

  return {
    domains: readonly(data),
    isLoading,
    error
  };
}

const domainColorsByAbbreviation: Record<string, Colors> = {
  ITGS: Colors.ITGS,
  'DS-GVO': Colors.DSGVO,
  NIS2: Colors.NIS2,
  DEFAULT: Colors.DEFAULT
};

export function getColorByDomainAbbreviation(abbreviation?: string): Colors {
  if (!abbreviation) return Colors.DEFAULT;
  return domainColorsByAbbreviation[abbreviation] ?? Colors.DEFAULT;
}

const domainColorsByName: Record<string, Colors> = {
  'IT-Grundschutz': Colors.ITGS,
  'DS-GVO': Colors.DSGVO,
  NIS2: Colors.NIS2,
  DEFAULT: Colors.DEFAULT
};

export function getColorByDomainName(name?: string): Colors {
  if (!name) return Colors.DEFAULT;
  return domainColorsByName[name] ?? Colors.DEFAULT;
}

export function useDomainColors() {
  return {
    domainColorsByName,
    domainColorsByAbbreviation
  };
}

function map(domains: IVeoDomain[]): TVeoDomain[] {
  return domains.map((domain) => ({
    name: domain.name,
    abbreviation: domain.abbreviation,
    id: domain.id,
    description: domain.description,
    color: getColorByDomainName(domain?.name)!,
    raw: domain
  }));
}

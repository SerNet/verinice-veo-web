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
import type { IVeoDomain } from '~/composables/api/queryDefinitions/domains';

export type TVeoDomain = {
  name: string;
  id: string;
  raw: IVeoDomain;
};

export enum Colors {
  ITGS = 'green',
  DSGVO = 'primary',
  NIS2 = 'purple',
  DEFAULT = ''
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

export function useDomainColors() {
  const domainColorsByAbbreviation: Record<string, Colors> = {
    ITGS: Colors.ITGS,
    'DS-GVO': Colors.DSGVO,
    NIS2: Colors.NIS2,
    DEFAULT: Colors.DEFAULT
  };

  const domainColorsByName: Record<string, Colors> = {
    'IT-Grundschutz': Colors.ITGS,
    'DS-GVO': Colors.DSGVO,
    NIS2: Colors.NIS2,
    DEFAULT: Colors.DEFAULT
  };

  return {
    domainColorsByName,
    domainColorsByAbbreviation
  };
}

function map(domains: IVeoDomain[]): TVeoDomain[] {
  return domains.map((domain) => ({
    name: domain.name,
    id: domain.id,
    raw: domain
  }));
}

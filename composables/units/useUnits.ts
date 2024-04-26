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

import { useQuerySync, useQuery } from '~/composables/api/utils/query';
import { useQueryClient } from '@tanstack/vue-query';
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { format } from 'date-fns';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import { Colors as VeoDomainColors } from '~/composables/domains/useDomains';

import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';

export type TVeoUnit = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  metaData: string;
  link: string | undefined;
  profilesUrl: string;
  domainsUrl: string;
  isFavorite: boolean;
  domains: Array<{
    id: string;
    name: string;
    abbreviation: string;
    color: VeoDomainColors;
    targetUri: string;
  }>;
  raw: IVeoUnit;
};

const currentUnit = ref<TVeoUnit | null>(null);
const isLoadingCurrentUnit = ref(false);

async function fetchCurrentUnit() {
  isLoadingCurrentUnit.value = true;
  const id = useRoute().params.unit;
  const result = await useQuerySync(unitQueryDefinitions.queries.fetch, { id });
  currentUnit.value = mapUnitValues({ unit: result });
  isLoadingCurrentUnit.value = false;
}

export function useCurrentUnit() {
  fetchCurrentUnit();
  return {
    data: currentUnit,
    isLoading: isLoadingCurrentUnit
  };
}

export function useUnits() {
  const units = ref<TVeoUnit[] | null>(null);
  const queryClient = useQueryClient();

  const { data: _data, isFetching, error } = useQuery(unitQueryDefinitions.queries.fetchAll);
  units.value = _data.value ? _data.value.map((unit) => mapUnitValues({ unit })) : [];
  watch(_data, () => (_data.value ? (units.value = _data.value.map((unit) => mapUnitValues({ unit }))) : []));

  return {
    data: units,
    isLoading: isFetching,
    error,
    invalidateUnitCache: () => queryClient.invalidateQueries({ queryKey: ['units'] }, { cancelRefetch: true })
  };
}

export function mapUnitValues({ unit }: { unit: IVeoUnit }): TVeoUnit {
  const favoriteUnitId: string | null = localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT);
  const { domainColorsByAbbreviation: COLORS } = useDomainColors();
  return {
    id: unit.id,
    name: unit.name,
    description: unit?.description,
    link: unit.domains.length ? `/${unit.id}/domains/${unit.domains[0].id}` : undefined,
    profilesUrl: `/units/${unit.id}/profiles`,
    domainsUrl: `/units/${unit.id}/domains`,
    isFavorite: unit.id === favoriteUnitId ? true : false,
    metaData: `by: ${unit.createdBy} | at: ${format(unit.createdAt, 'dd.MM.yyyy')}`,
    domains: unit.domains.map((d) => ({
      id: d.id!,
      name: d.name ?? '',
      abbreviation: d.abbreviation ?? '',
      color: d.abbreviation && COLORS.hasOwnProperty(d.abbreviation) ? COLORS[d.abbreviation] : COLORS['DEFAULT'],
      targetUri: d.targetUri
    })),
    raw: toRaw(unit)
  };
}

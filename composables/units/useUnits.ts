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
import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { format } from 'date-fns';
import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import { Colors as VeoDomainColors } from '~/composables/domains/useDomains';

export type TVeoUnit = {
  id: string;
  name: string;
  description: string;
  metaData: string;
  link: string;
  profilesUrl: string;
  isFavorite: boolean;
  domains: Array<{
    id: string;
    name: string;
    abbreviation: string;
    color: VeoDomainColors;
  }>;
  raw: IVeoUnit;
};

export type TVeoCurrentUnit = {
  id: string;
  name: string;
  associatedDomains: string[];
  raw: IVeoUnit;
};

const units = ref<TVeoUnit[] | null>(null);
const currentUnit = ref<TVeoCurrentUnit | null>(null);
const currentUnitId = ref<string | null>(null);
const isLoadingCurrentUnit = ref(false);
const isLoadingUnits = ref(false);

async function fetchUnits() {
  if (!currentUnit.value) {
    isLoadingUnits.value = true;
    const favoriteUnitId: string | null = localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT);
    const result = await useQuerySync(unitQueryDefinitions.queries.fetchAll);
    units.value = result.map((unit: IVeoUnit) => mapUnitValues({ unit, favoriteUnitId }));
    isLoadingUnits.value = false;
  }
}

async function fetchCurrentUnit() {
  isLoadingCurrentUnit.value = true;
  const id = useRoute().params.unit;
  if (!currentUnit.value || currentUnitId.value !== id) {
    const result = await useQuerySync(unitQueryDefinitions.queries.fetch, { id });
    currentUnit.value = {
      name: result.name,
      id: result.id,
      associatedDomains: toRaw(result).domains.map((d) => d.id!),
      raw: result
    };
    currentUnitId.value = id;
  }
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
  fetchUnits();

  return {
    data: units,
    isLoading: isLoadingUnits
  };
}

export function mapUnitValues({ unit, favoriteUnitId }: { unit: IVeoUnit; favoriteUnitId: string | null }): TVeoUnit {
  const { domainColorsByAbbreviation: COLORS } = useDomainColors();
  return {
    id: unit.id,
    name: unit.name,
    description: unit?.description,
    link: `/${unit.id}/domains/${unit.domains?.[0].id}`,
    profilesUrl: `/units/${unit.id}/profiles`,
    isFavorite: unit.id === favoriteUnitId ? true : false,
    metaData: `by: ${unit.createdBy} | at: ${format(unit.createdAt, 'dd.MM.yyyy')}`,
    domains: unit.domains.map((d) => ({
      id: d.id!,
      name: d.name ?? '',
      abbreviation: d.abbreviation ?? '',
      color: d.abbreviation && COLORS.hasOwnProperty(d.abbreviation) ? COLORS[d.abbreviation] : COLORS['DEFAULT']
    })),
    raw: toRaw(unit)
  };
}

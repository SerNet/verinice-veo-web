/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
import { useContext } from '@nuxtjs/composition-api';
import { MaybeRef } from '@tanstack/vue-query/build/lib/types';

import { QueryOptions, useQuery } from './utils/query';
import { IVeoUnit } from '~/types/VeoTypes';

export interface IVeoFetchUnitParameters {
  id: string;
}

export const unitsQueryKeys = {
  units: ['units'] as const,
  unit: (queryParameters: IVeoFetchUnitParameters) => ['unit', queryParameters.id] as const
};

export const useFetchUnits = (queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoUnit[]>(unitsQueryKeys.units, $api.unit.fetchAll, {}, { ...queryOptions, staleTime: 10 * 60 * 1000, placeholderData: [] });
};

export const useFetchUnit = (queryParameters: MaybeRef<IVeoFetchUnitParameters>, queryOptions?: QueryOptions) => {
  const { $api } = useContext();

  return useQuery<IVeoUnit[]>(unitsQueryKeys.unit, $api.unit.fetch, queryParameters, { ...queryOptions, staleTime: 10 * 60 * 1000 });
};

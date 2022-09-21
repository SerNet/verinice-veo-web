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
import { QueryFunction, QueryKey } from 'react-query/types/core';
import { useQuery as vueQueryUseQuery } from 'vue-query';
import { UseQueryOptions } from 'vue-query/lib/vue';

export const useQuery = (queryKey: QueryKey, request: QueryFunction, options: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) => {
  const { $config } = useContext();

  const primaryQueryKey = Array.isArray(queryKey) ? queryKey[0] : queryKey;

  if ($config.debugCache === true || (Array.isArray($config.debugCache) && $config.debugCache.includes(primaryQueryKey))) {
    // eslint-disable-next-line no-console
    console.log(`useQuery called for "${primaryQueryKey}" with query key "${JSON.stringify(queryKey)}" and options "${JSON.stringify(options)}"`);
  }
  return vueQueryUseQuery(queryKey, request, options);
};

/*
 * verinice.veo web
 * Copyright (C) 2025 jae
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
import { useQuery, type UseQueryReturnType } from 'vue-query-v5';
import { read } from '~/requests/crud';

import type { VeoElementTypesSingular } from '~/types/VeoTypes';
import type { IVeoObjectHistoryEntry, IVeoLegacyObjectHistoryEntry } from '~/types/history';

type UseHistoryReturnType<T> = UseQueryReturnType<T, Error>;

export function useRevisions(
  domainId: Ref<string>,
  objectType: Ref<keyof typeof VeoElementTypesSingular>,
  objectId: Ref<string>
): UseHistoryReturnType<IVeoObjectHistoryEntry[]> {
  const getPath = (domainId: string, objectType: keyof typeof VeoElementTypesSingular, objectId: string) => {
    if (!domainId || !objectType || !objectId) {
      throw new Error('Missing parameters to build revisions path');
    }
    return `history/revisions?uri=/domains/${domainId}/${objectType}/${objectId}`;
  };

  const enabled = computed(() => !!objectType.value && !!objectId.value && !!domainId.value);

  const path = computed(() => (enabled.value ? getPath(domainId.value, objectType.value, objectId.value) : ''));

  return useQuery({
    queryKey: ['revisions', { objectType, objectId, domainId }],
    queryFn: () => read({ path: path.value }),
    refetchInterval: 10000,
    enabled
  });
}

export function useLatestRevisions(unitId?: Ref<string>): UseHistoryReturnType<IVeoLegacyObjectHistoryEntry[]> {
  const getPath = (unitId: string) => {
    if (!unitId) {
      throw new Error('Missing unitId to build latest revisions path');
    }
    return `history/revisions/my-latest?owner=/units/${unitId}`;
  };

  const path = computed(() => getPath(unitId?.value ? unitId.value : (useRoute().params.unit as string)));

  return useQuery({
    queryKey: ['latestRevisions'],
    refetchOnMount: 'always',
    queryFn: () => read({ path: path.value }),
    enabled: !!path.value
  });
}

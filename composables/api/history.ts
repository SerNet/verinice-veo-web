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
import { useQuery } from 'vue-query-v5';
import { read } from '~/requests/crud';
import type { VeoElementTypesSingular } from '~/types/VeoTypes';

function getPath(domainId: string, objectType: keyof typeof VeoElementTypesSingular, objectId: string) {
  if (!domainId || !objectType || !objectId) return '';
  return `history/revisions?uri=/domains/${domainId}/${objectType}/${objectId}`;
}

export function useRevisions(
  domainId: Ref<string>,
  objectType: Ref<keyof typeof VeoElementTypesSingular>,
  objectId: Ref<string>
) {
  const enabled = computed(() => !!objectType.value && !!objectId.value && !!domainId.value);

  const path = computed(() => (enabled.value ? getPath(domainId.value, objectType.value, objectId.value) : ''));

  return useQuery({
    queryKey: ['revisions', { objectType, objectId, domainId }],
    queryFn: () => read({ path: path.value }),
    refetchInterval: 2000,
    enabled
  });
}

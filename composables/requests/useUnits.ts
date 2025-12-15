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
import { useQuery, useQueryClient, useMutation } from 'vue-query-v5';
import { read, mutate, type RequestOptions } from '~/requests/crud';

import { format } from 'date-fns';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';
import { getIsPending } from '~/composables/helpers';

import type { IVeoUnit } from '~/composables/api/queryDefinitions/units';
import type { IVeoLink } from '~/types/VeoTypes';

export type TVeoUnit = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  metaData: {
    createdAt: string;
    createdBy: string;
  };
  link: string | undefined;
  profilesUrl: string;
  domainsUrl: string;
  detailsUrl: string;
  isFavorite: boolean;
  domains: Array<{
    id: string;
    name: string;
    abbreviation: string;
    color: string;
    targetUri: string;
    dashboardUrl: string;
  }>;
  raw: IVeoUnit;
};

export function useUnit(id?: Ref<string>) {
  const unitId = computed(() => (id?.value ? id.value : useRoute().params.unit));
  const queryKey = ['units', { unitId }];
  const enabled = computed(() => !!unitId.value);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: ({ queryKey }) => {
      const { unitId } = queryKey[1] as { unitId: string };
      const path = `/units/${unitId}`;
      return unitId ? read({ path }) : Promise.reject('no unit id');
    },
    enabled
  });

  const unit = computed(() => {
    if (!data.value) return;
    return mapUnitValues(data.value);
  });

  return {
    data: unit,
    isLoading,
    isFetching,
    error
  };
}

export function useUnits() {
  const {
    data,
    isLoading,
    isFetching,
    error,

    refetch
  } = useQuery({
    queryKey: ['units'],
    refetchOnMount: false,
    queryFn: async () => {
      const rawData = await read({ path: '/units' });
      return rawData.map((unit: IVeoUnit) => mapUnitValues(unit));
    }
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch
  };
}

type Method = 'POST' | 'PUT' | 'DELETE';
export function useUnitMutation(unit: Ref<IVeoUnit>, method: Method = 'PUT') {
  const path = computed(() => `/units/${unit.value?.id}`);
  const options = computed(() =>
    unit.value && method ?
      {
        ...(method !== 'DELETE' ? { body: unit.value } : {}),
        method
      }
    : {}
  );

  const query = useDataMutation(path, options, ['units']);

  return {
    isPending: computed(() => getIsPending(query.status.value)),
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    mutate: query.mutate
  };
}

export function useCreateUnitAndMaybeApplyProfile(
  unit: Ref<{ name: string; description?: string; domains: IVeoLink[] }>,
  profile?: Ref<{ id: string; domainId: string }>
) {
  const queryClient = useQueryClient();

  const mutationFn = async () => {
    const path = '/units';
    const options: Ref<RequestOptions> = computed(() =>
      unit.value?.name && unit.value?.domains.length ?
        {
          body: unit.value,
          method: 'POST'
        }
      : {}
    );

    const response = await mutate({ path, options: options.value });

    if (!profile?.value?.id) {
      return response;
    }

    const unitId = response.resourceId;
    const profilePath = computed(
      () => `/domains/${profile.value.domainId}/profiles/${profile.value.id}/incarnation?unit=${unitId}`
    );

    return mutate({
      path: profilePath.value,
      options: { method: 'POST' }
    });
  };

  const query = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    }
  });

  return {
    ...query,
    isPending: computed(() => getIsPending(query.status.value))
  };
}

export function mapUnitValues(unit: IVeoUnit): TVeoUnit {
  const favoriteUnitId: string | null = localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT);
  return {
    id: unit.id,
    name: unit.name,
    description: unit?.description,
    updatedAt: unit.updatedAt,
    link: unit.domains.length ? `/${unit.id}/domains/${unit.domains[0]!.id}` : undefined,
    profilesUrl: `/units/${unit.id}/profiles`,
    domainsUrl: `/units/${unit.id}/domains`,
    detailsUrl: `/units/${unit.id}/details`,
    isFavorite: unit.id === favoriteUnitId,
    metaData: {
      createdBy: unit.createdBy,
      createdAt: format(unit.createdAt, 'dd.MM.yyyy')
    },
    domains: unit.domains.map((d) => ({
      id: d.id!,
      name: d.name ?? '',
      abbreviation: d.abbreviation ?? '',
      color: useDomainColor(d.name),
      targetUri: d.targetUri,
      dashboardUrl: `/${unit.id}/domains/${d.id}`
    })),
    raw: toRaw(unit)
  };
}

// Sort helper: show last updated unit on top
export function sortUnits(a: TVeoUnit, b: TVeoUnit): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

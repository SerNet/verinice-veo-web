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
import { computed, Ref } from '@nuxtjs/composition-api';
import { useQueryClient } from '@tanstack/vue-query';
import { max, omit } from 'lodash';

import { useVeoUser } from '../VeoUser';
import { IVeoQueryTransformationMap, QueryOptions, useQuery } from './utils/query';
import { IVeoMutationParameters, IVeoMutationTransformationMap, MutationOptions, useMutation } from './utils/mutation';
import { VeoApiReponseType } from './utils/request';
import { IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions } from '~/types/VeoTypes';

export interface IVeoFetchObjectsParameters extends IVeoPaginationOptions {
  unit: string;
  endpoint: string;
  page?: number;
  displayName?: string;
  subType?: string;
  childElementIds?: string;
}

export interface IVeoFetchObjectParameters {
  endpoint: string;
  id: string;
}

export interface IVeoDeleteObjectParameters {
  endpoint: string;
  id: string;
}

export const objectsQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetchAll: (queryParameters: IVeoFetchObjectsParameters) => ({ params: { endpoint: queryParameters.endpoint }, query: omit(queryParameters, 'endpoint') }),
  fetch: (queryParameters: IVeoFetchObjectParameters) => ({ params: queryParameters })
};

export const objectsMutationParameterTransformationMap: IVeoMutationTransformationMap = {
  delete: (mutationParameters: IVeoDeleteObjectParameters) => ({ params: { endpoint: mutationParameters.endpoint, id: mutationParameters.id } })
};

/**
 * Loads all objects up to a limit.
 *
 * @param queryParameters The parameters required by the api call.
 * @param queryOptions Options modifying query behaviour.
 * @returns Returns all objects matching the parameter criteria.
 */
export const useFetchObjects = (queryParameters: Ref<IVeoFetchObjectsParameters>, queryOptions?: QueryOptions) => {
  const { tablePageSize } = useVeoUser();

  const modifiedQueryParameters = computed(() => ({
    ...queryParameters.value,
    // Set default page size if not explicitly stated. Set page size to 1000 if the user selects "All" in the ui (Vuetify returns -1 in that case)
    size: queryParameters.value.size === undefined ? tablePageSize.value : queryParameters.value.size === -1 ? 1000 : queryParameters.value.size,
    page: queryParameters.value.page ? max([queryParameters.value.page - 1, 0]) : 0
  }));
  return useQuery<IVeoFetchObjectsParameters, IVeoPaginatedResponse<IVeoEntity[]>>(
    'objects',
    {
      url: '/api/:endpoint',
      onDataFetched: (result) => {
        result.items.forEach((item: IVeoEntity) => {
          /*
           * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
           * members. However we combine both entity types as they get used more or less the same way
           */
          if (!item.parts) {
            item.parts = [];
          }
          if (!item.members) {
            item.members = [];
          }
          // The frontend sets the display name as the backend only sets it for links. Gets used for example in the breadcrumbs.
          item.displayName = `${item.designator} ${item.abbreviation || ''} ${item.name}`;
        });

        // +1, because the first page for the api is 0, however vuetify expects it to be 1
        result.page = result.page + 1;
        return result;
      }
    },
    modifiedQueryParameters,
    objectsQueryParameterTransformationMap.fetchAll,
    queryOptions
  );
};
/**
 * Loads a single object, including object details
 *
 * @param queryParameters The parameters required by the api call.
 * @param queryOptions Options modifying query behaviour.
 * @returns Returns the object.
 */
export const useFetchObject = (queryParameters: Ref<IVeoFetchObjectParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchObjectParameters, IVeoEntity>(
    'object',
    {
      url: '/api/:endpoint/:id',
      onDataFetched: (result) => {
        if (!result.parts) {
          result.parts = [];
        }
        if (!result.members) {
          result.members = [];
        }
        result.displayName = `${result.designator} ${result.abbreviation || ''} ${result.name}`;
        return result;
      }
    },
    queryParameters,
    objectsQueryParameterTransformationMap.fetch,
    queryOptions
  );

export const useDeleteObject = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoDeleteObjectParameters, void>(
    'object',
    {
      url: '/api/:endpoint/:id',
      method: 'DELETE',
      reponseType: VeoApiReponseType.VOID
    },
    objectsMutationParameterTransformationMap.delete,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(['objects', (variables as unknown as IVeoMutationParameters<IVeoDeleteObjectParameters>).params?.endpoint]);
        queryClient.invalidateQueries([
          'object',
          (variables as unknown as IVeoMutationParameters<IVeoDeleteObjectParameters>).params?.endpoint,
          (variables as unknown as IVeoMutationParameters<IVeoDeleteObjectParameters>).params?.id
        ]);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

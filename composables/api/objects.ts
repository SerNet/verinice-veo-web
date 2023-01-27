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
import { Ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { max, omit } from 'lodash';

import { useVeoUser } from '../VeoUser';
import { IVeoQueryTransformationMap, QueryOptions, useQuery } from './utils/query';
import { IVeoMutationParameters, IVeoMutationTransformationMap, MutationOptions, useMutation } from './utils/mutation';
import { VeoApiReponseType } from './utils/request';
import { IVeoAPIMessage, IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions, IVeoRisk } from '~/types/VeoTypes';
import { getEntityDetailsFromLink } from '~~/lib/utils';

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

export interface IVeoFetchParentObjectsParameters extends IVeoPaginationOptions {
  parentEndpoint: string;
  childObjectId: string;
  unitId: string;
}

export interface IVeoFetchObjectChildrenParameters {
  endpoint: string;
  id: string;
}

export interface IVeoFetchScopeChildrenParameters {
  id: string;
}

export interface IVeoFetchRisksParameters {
  endpoint: string;
  id: string;
}

export interface IVeoFetchRiskParameters {
  endpoint: string;
  objectId: string;
  scenarioId: string;
}

export interface IVeoCreateObjectParameters {
  endpoint: string;
  object: IVeoEntity;
  parentScopes?: string[];
}

export interface IVeoUpdateObjectParameters {
  endpoint: string;
  object: IVeoEntity;
}

export interface IVeoDeleteObjectParameters {
  endpoint: string;
  id: string;
}

export interface IVeoCreateRiskParameters {
  endpoint: string;
  objectId: string;
  risk: IVeoRisk;
}

export interface IVeoDeleteRiskParameters {
  endpoint: string;
  objectId: string;
  scenarioId: string;
}

export const objectsQueryParameterTransformationMap: IVeoQueryTransformationMap = {
  fetchAll: (queryParameters: IVeoFetchObjectsParameters) => ({ params: { endpoint: queryParameters.endpoint }, query: omit(queryParameters, 'endpoint') }),
  fetch: (queryParameters: IVeoFetchObjectParameters) => ({ params: queryParameters }),
  fetchObjectChildren: (queryParameters: IVeoFetchObjectChildrenParameters) => ({ params: queryParameters }),
  fetchScopeChildren: (queryParameters: IVeoFetchScopeChildrenParameters) => ({ params: queryParameters }),
  fetchRisks: (queryParameters: IVeoFetchRisksParameters) => ({ params: queryParameters }),
  fetchRisk: (queryParameters: IVeoFetchRiskParameters) => ({ params: { id: queryParameters.objectId, endpoint: queryParameters.endpoint, scenarioId: queryParameters.scenarioId } })
};

export const objectsMutationParameterTransformationMap: IVeoMutationTransformationMap = {
  create: (mutationParameters: IVeoCreateObjectParameters) => {
    const _object = mutationParameters.object;
    // Remove properties of the object only used in the frontend
    if (_object.type === 'scope') {
      // @ts-ignore Is only set in DTO if object is any type expect scope
      delete _object.parts;
    } else {
      // @ts-ignore Is only set in DTO if object is of type scope
      delete _object.members;
    }
    return { params: { endpoint: mutationParameters.endpoint }, query: { scopes: mutationParameters.parentScopes?.join(',') }, json: _object };
  },
  update: (mutationParameters: IVeoUpdateObjectParameters) => {
    const _object = mutationParameters.object;
    // Remove properties of the object only used in the frontend
    if (_object.type === 'scope') {
      // @ts-ignore Is only set in DTO if object is any type expect scope
      delete _object.parts;
    } else {
      // @ts-ignore Is only set in DTO if object is of type scope
      delete _object.members;
    }
    // @ts-ignore Workaround for history: History has 9 digit second precision while default api only accepts 6 digit precision
    delete _object.createdAt;
    // @ts-ignore Workaround for history: History has 9 digit second precision while default api only accepts 6 digit precision
    delete _object.updatedAt;
    // @ts-ignore Display name is generated in the frontend, so we remove it from the DTO before sending it to the backend
    delete _object.displayName;
    return { params: { endpoint: mutationParameters.endpoint, id: mutationParameters.object.id }, json: _object };
  },
  delete: (mutationParameters: IVeoDeleteObjectParameters) => ({ params: mutationParameters }),
  createRisk: (mutationParameters: IVeoCreateRiskParameters) => ({
    params: { endpoint: mutationParameters.endpoint, objectId: mutationParameters.objectId },
    json: mutationParameters.risk
  }),
  deleteRisk: (mutationParameters: IVeoDeleteRiskParameters) => ({ params: mutationParameters })
};

export const formatObject = (object: IVeoEntity) => {
  /*
   * We set both objects if they don't exist, as scopes don't contain parts and other entities don't contain
   * members. However we combine both entity types as they get used more or less the same way
   */
  if (!object.parts) {
    object.parts = [];
  }
  if (!object.members) {
    object.members = [];
  }
  // The frontend sets the display name as the backend only sets it for links. Gets used for example in the breadcrumbs.
  object.displayName = `${object.designator} ${object.abbreviation || ''} ${object.name}`;
  return object;
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
        result.items.map((item) => formatObject(item));

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
      onDataFetched: (result) => formatObject(result)
    },
    queryParameters,
    objectsQueryParameterTransformationMap.fetch,
    queryOptions
  );

export const useFetchParentObjects = (queryParameters: Ref<IVeoFetchParentObjectsParameters>, queryOptions?: QueryOptions) => {
  const transformedQueryParameters = computed(() => ({
    ...omit(queryParameters.value, 'unitId', 'parentEndpoint', 'childObjectId'),
    unit: queryParameters.value.unitId,
    endpoint: queryParameters.value.parentEndpoint,
    childElementIds: queryParameters.value.childObjectId,
    size: -1
  }));
  return useFetchObjects(transformedQueryParameters, queryOptions);
};

export const useFetchObjectChildren = (queryParameters: Ref<IVeoFetchObjectChildrenParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchObjectChildrenParameters, IVeoEntity[]>(
    'childObjects',
    {
      url: '/api/:endpoint/:id/parts',
      onDataFetched: (result) => result.map((item) => formatObject(item))
    },
    queryParameters,
    objectsQueryParameterTransformationMap.fetchObjectChildren,
    queryOptions
  );

export const useFetchScopeChildren = (queryParameters: Ref<IVeoFetchScopeChildrenParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchScopeChildrenParameters, IVeoEntity[]>(
    'childScopes',
    {
      url: '/api/scopes/:id/members',
      onDataFetched: (result) => result.map((item) => formatObject(item))
    },
    queryParameters,
    objectsQueryParameterTransformationMap.fetchScopeChildren,
    queryOptions
  );

export const useFetchRisks = (queryParameters: Ref<IVeoFetchRisksParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchRisksParameters, IVeoRisk[]>('risks', { url: '/api/:endpoint/:id/risks' }, queryParameters, objectsQueryParameterTransformationMap.fetchRisks, queryOptions);

export const useFetchRisk = (queryParameters: Ref<IVeoFetchRiskParameters>, queryOptions?: QueryOptions) =>
  useQuery<IVeoFetchRiskParameters, IVeoRisk>('risk', { url: '/api/:endpoint/:id/risks/:scenarioId' }, queryParameters, objectsQueryParameterTransformationMap.fetchRisk, queryOptions);

export const useCreateObject = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoCreateObjectParameters, IVeoAPIMessage>(
    'object',
    {
      url: '/api/:endpoint/',
      method: 'POST'
    },
    objectsMutationParameterTransformationMap.create,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(['objects']);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

export const useUpdateObject = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoUpdateObjectParameters, IVeoEntity>(
    'object',
    {
      url: '/api/:endpoint/:id',
      method: 'PUT',
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
    objectsMutationParameterTransformationMap.update,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(['objects']);
        queryClient.invalidateQueries([
          'object',
          {
            endpoint: (variables as unknown as IVeoMutationParameters).params?.endpoint,
            id: (variables as unknown as IVeoMutationParameters).params?.id
          }
        ]);
        queryClient.invalidateQueries([
          'childObjects',
          {
            endpoint: (variables as unknown as IVeoMutationParameters).params?.endpoint,
            id: (variables as unknown as IVeoMutationParameters).params?.id
          }
        ]);
        queryClient.invalidateQueries([
          'childScopes',
          {
            id: (variables as unknown as IVeoMutationParameters).params?.id
          }
        ]);
        queryClient.invalidateQueries(['objects']); // Invalid all object lists, as the parent endpoint uses the same key (and we want an updated edit date in the list for this object)
        setTimeout(() => {
          queryClient.invalidateQueries(['versions']);
        }, 5000); // Only invalidate after 5 seconds, as the history sevice isn't updated as sonn as the object is updated
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

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
        queryClient.invalidateQueries(['objects']);
        queryClient.invalidateQueries(['object', (variables as unknown as IVeoMutationParameters).params]);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

export const useCreateRisk = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoCreateRiskParameters, IVeoRisk>(
    'risk',
    {
      url: '/api/:endpoint/:objectId/risks',
      method: 'POST'
    },
    objectsMutationParameterTransformationMap.createRisk,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ['risks'] });
        queryClient.invalidateQueries({ queryKey: [
          'risk',
          {
            scenarioId: getEntityDetailsFromLink((variables as unknown as any).json.scenario).id,
            objectId: (variables as unknown as IVeoMutationParameters).params?.objectId,
            endpoint: (variables as unknown as IVeoMutationParameters).params?.endpoint
          }
        ]});
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

// Updating and creating risks is the exact same request, however we alias it to make the code more understandable.
export const useUpdateRisk = useCreateRisk;

export const useDeleteRisk = (mutationOptions?: MutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation<IVeoDeleteRiskParameters, void>(
    'risk',
    {
      url: '/api/:endpoint/:objectId/risks/:scenarioId',
      method: 'DELETE',
      reponseType: VeoApiReponseType.VOID
    },
    objectsMutationParameterTransformationMap.deleteRisk,
    {
      ...mutationOptions,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries([
          'risks',
          {
            endpoint: (variables as unknown as IVeoMutationParameters).params?.endpoint,
            id: (variables as unknown as IVeoMutationParameters).params?.objectId
          }
        ]);
        if (mutationOptions?.onSuccess) {
          mutationOptions.onSuccess(data, variables, context);
        }
      }
    }
  );
};

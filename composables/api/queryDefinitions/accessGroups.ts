import { IVeoMutationDefinition } from '../utils/mutation';
import { IVeoQueryDefinition } from '../utils/query';
import { VeoApiResponseType } from '../utils/request';

export interface IVeoAccessGroupUnitPermission {
  unitId: string;
  name: string;
  read: boolean;
  write: boolean;
}

export interface IVeoAccessGroup {
  id: string;
  name: string;
  units: IVeoAccessGroupUnitPermission[];
}

export interface IVeoCreateAccessGroupParameters {
  name: string;
  units: Record<string, 'READ_ONLY' | 'READ_WRITE'>;
}

export interface IVeoUpdateAccessGroupParameters {
  id: string;
  name: string;
  units: Record<string, 'READ_ONLY' | 'READ_WRITE'>;
}

export interface IVeoFetchAccessGroupParameters {
  id: string;
}

export interface IVeoDeleteAccessGroupParameters {
  id: string;
}

export interface IVeoRestrictUnitAccessParameters {
  restrictUnitAccess: boolean;
}

export default {
  queries: {
    fetchAccessGroups: {
      primaryQueryKey: 'accessGroups',
      url: '/api/accounts/access-groups',
      queryParameterTransformationFn: () => ({}),
      staticQueryOptions: { placeholderData: [] }
    } as IVeoQueryDefinition<Record<string, never>, IVeoAccessGroup[]>,

    fetchAccessGroup: {
      primaryQueryKey: 'accessGroup',
      url: '/api/accounts/access-groups/:id',
      queryParameterTransformationFn: (queryParameters) => ({
        params: queryParameters
      })
    } as IVeoQueryDefinition<IVeoFetchAccessGroupParameters, IVeoAccessGroup>,

    fetchUnits: {
      primaryQueryKey: 'units',
      url: '/api/accounts/access-groups/:id',
      queryParameterTransformationFn: (queryParameters) => ({
        params: queryParameters
      })
    } as IVeoQueryDefinition<IVeoFetchAccessGroupParameters, IVeoAccessGroup>,

    isRestrictUnitAccess: {
      primaryQueryKey: 'restrictUnitAccess',
      url: '/api/accounts/client-config',
      queryParameterTransformationFn: () => ({}),
      responseType: VeoApiResponseType.JSON
    } as IVeoQueryDefinition<Record<string, never>, { restrictUnitAccess: boolean }>
  },

  mutations: {
    createAccessGroup: {
      primaryQueryKey: 'accessGroup',
      url: '/api/accounts/access-groups',
      method: 'POST',
      mutationParameterTransformationFn: (mutationParameters) => ({
        json: mutationParameters
      }),
      staticMutationOptions: {
        onSuccess: (queryClient) => {
          queryClient.invalidateQueries(['accessGroups']);
        }
      }
    } as IVeoMutationDefinition<IVeoCreateAccessGroupParameters, IVeoAccessGroup>,

    updateAccessGroup: {
      primaryQueryKey: 'accessGroup',
      url: '/api/accounts/access-groups/:id',
      method: 'PUT',
      responseType: VeoApiResponseType.VOID,
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: { id: mutationParameters.id },
        json: {
          name: mutationParameters.name,
          units: mutationParameters.units
        }
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables) => {
          queryClient.invalidateQueries(['accessGroups']);
          queryClient.invalidateQueries(['accessGroup', { id: variables.params?.id || '' }]);
        }
      }
    } as IVeoMutationDefinition<IVeoUpdateAccessGroupParameters, void>,

    deleteAccessGroup: {
      primaryQueryKey: 'accessGroup',
      url: '/api/accounts/access-groups/:id',
      method: 'DELETE',
      responseType: VeoApiResponseType.VOID,
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: { id: mutationParameters.id }
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables) => {
          queryClient.invalidateQueries(['accessGroups']);
          queryClient.invalidateQueries(['accessGroup', { id: variables.params?.id || '' }]);
        }
      }
    } as IVeoMutationDefinition<IVeoDeleteAccessGroupParameters, void>,

    updateRestrictUnitAccess: {
      primaryQueryKey: 'restrictUnitAccess',
      url: '/api/accounts/client-config',
      method: 'PUT',
      responseType: VeoApiResponseType.VOID,
      mutationParameterTransformationFn: (mutationParameters: IVeoRestrictUnitAccessParameters) => ({
        json: {
          restrictUnitAccess: mutationParameters.restrictUnitAccess
        }
      }),
      staticMutationOptions: {
        onSuccess: (queryClient) => {
          queryClient.invalidateQueries(['restrictUnitAccess']);
        }
      },
      headers: {
        'Content-Type': 'application/json'
      }
    } as IVeoMutationDefinition<IVeoRestrictUnitAccessParameters, void>
  }
};

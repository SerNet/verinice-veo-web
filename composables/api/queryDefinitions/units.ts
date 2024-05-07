/*
 * verinice.veo web
 * Copyright (C) 2023  Jonas Heitmann
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
import { IVeoAPIMessage, IVeoBaseObject, IVeoLink, IVeoUnitIncarnationDescriptions } from '~/types/VeoTypes';
import { IVeoMutationDefinition } from '../utils/mutation';
import { IVeoQueryDefinition, STALE_TIME } from '../utils/query';
import { VeoApiReponseType } from '../utils/request';
import { omit } from 'lodash';

export interface IVeoUnit extends IVeoBaseObject {
  name: string;
  description: string;
  domains: IVeoLink[];
  units: IVeoUnit[];
}

export interface IVeoExportedUnit {
  unit: IVeoUnit;
}

export interface IVeoFetchUnitParameters {
  id: string;
}

export interface IVeoCreateUnitParameters {
  name: string;
  description: string;
  domains: IVeoLink[];
}

export interface IVeoUpdateUnitParameters extends IVeoCreateUnitParameters {
  id: string;
}

export interface IVeoDeleteUnitParameters {
  id: string;
}

export interface IVeoExportUnitParameters {
  unitId: string;
}

type TailoringReferenceType =
  | 'OMIT'
  | 'LINK'
  | 'LINK_EXTERNAL'
  | 'COPY'
  | 'COPY_ALWAYS'
  | 'PART'
  | 'COMPOSITE'
  | 'RISK'
  | 'SCOPE'
  | 'MEMBER'
  | 'CONTROL_IMPLEMENTATION';

export interface IVeoFetchIncarnationDescriptionParameters {
  unitId: string;
  domainId: string;
  itemIds: string[];
  mode?: 'DEFAULT' | 'MANUAL';
  exclude?: TailoringReferenceType[];
  include?: TailoringReferenceType[];
  useExistingIncarnations?: 'NEVER' | 'FOR_REFERENCED_ITEMS' | 'ALWAYS';
}

export interface IVeoUpdateIncarnationParameters {
  incarnations: IVeoUnitIncarnationDescriptions;
  unitId: string;
}

export default {
  queries: {
    fetchAll: {
      primaryQueryKey: 'units',
      url: '/api/units',
      queryParameterTransformationFn: () => ({}),
      staticQueryOptions: {
        staleTime: STALE_TIME.MEDIUM,
        placeholderData: []
      }
    } as IVeoQueryDefinition<Record<string, never>, IVeoUnit[]>,
    fetch: {
      primaryQueryKey: 'unit',
      url: '/api/units/:id',
      queryParameterTransformationFn: (queryParameters) => ({
        params: queryParameters
      }),
      staticQueryOptions: {
        staleTime: STALE_TIME.MEDIUM
      }
    } as IVeoQueryDefinition<IVeoFetchUnitParameters, IVeoUnit>,
    fetchIncarnationDescriptions: {
      primaryQueryKey: 'incarnations',
      url: '/api/units/:unitId/domains/:domainId/incarnation-descriptions',
      queryParameterTransformationFn: (queryParameters) => ({
        params: {
          unitId: queryParameters.unitId,
          domainId: queryParameters.domainId
        },
        query: {
          itemIds: queryParameters.itemIds,
          exclude: queryParameters.exclude
        }
      })
    } as IVeoQueryDefinition<IVeoFetchIncarnationDescriptionParameters, IVeoUnitIncarnationDescriptions>,
    exportUnit: {
      primaryQueryKey: 'units',
      url: '/api/units/:unitId/export',
      queryParameterTransformationFn: (queryParameters) => ({
        params: {
          unitId: queryParameters.unitId
        }
      })
    } as IVeoQueryDefinition<IVeoExportUnitParameters, IVeoExportedUnit>
  },
  mutations: {
    create: {
      primaryQueryKey: 'form',
      url: '/api/units',
      method: 'POST',
      mutationParameterTransformationFn: (mutationParameters) => ({
        json: mutationParameters
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, _variables, _context) => {
          queryClient.invalidateQueries(['units']);
        }
      }
    } as IVeoMutationDefinition<IVeoCreateUnitParameters, IVeoAPIMessage>,
    update: {
      primaryQueryKey: 'form',
      url: '/api/units/:id',
      method: 'PUT',
      mutationParameterTransformationFn: (mutationParameters) => ({
        json: omit(mutationParameters, 'id'),
        params: {
          id: mutationParameters.id
        }
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries(['units']);
          queryClient.invalidateQueries(['unit', { id: variables.params?.id }]);
        }
      }
    } as IVeoMutationDefinition<IVeoUpdateUnitParameters, IVeoUnit>,
    delete: {
      primaryQueryKey: 'unit',
      url: '/api/units/:id',
      method: 'DELETE',
      reponseType: VeoApiReponseType.VOID,
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: mutationParameters
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries(['units']);
          queryClient.invalidateQueries(['unit', variables.params]);
        }
      }
    } as IVeoMutationDefinition<IVeoDeleteUnitParameters, void>,
    updateIncarnations: {
      primaryQueryKey: 'incarnations',
      url: '/api/units/:unitId/incarnations',
      method: 'POST',
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: {
          unitId: mutationParameters.unitId
        },
        json: mutationParameters.incarnations
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, _variable, _context) => {
          queryClient.invalidateQueries(['incarnations']);
        }
      }
    } as IVeoMutationDefinition<IVeoUpdateIncarnationParameters, IVeoUnitIncarnationDescriptions>
  }
};

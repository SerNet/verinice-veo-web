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
import { IVeoAPIMessage, IVeoUnit } from "~~/types/VeoTypes";
import { IVeoMutationDefinition } from "../utils/mutation";
import { IVeoQueryDefinition, IVeoQueryDefinitions, STALE_TIME } from "../utils/query";
import { VeoApiReponseType } from "../utils/request";

export interface IVeoFetchUnitParameters {
  id: string;
}
  
export interface IVeoCreateUnitParameters {
  name: string;
  description: string;
}
  
export interface IVeoDeleteUnitParameters {
  id: string;
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
      queryParameterTransformationFn: (queryParameters) => ({ params: queryParameters }),
      staticQueryOptions: {
        staleTime: STALE_TIME.MEDIUM
      }
    } as IVeoQueryDefinition<IVeoFetchUnitParameters, IVeoUnit>
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
    delete: {
      primaryQueryKey: 'unit',
      url: '/api/units/:id',
      method: 'DELETE',
      reponseType: VeoApiReponseType.VOID,
      mutationParameterTransformationFn: (mutationParameters) => ({ params: mutationParameters }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries(['units']);
          queryClient.invalidateQueries(['unit', variables.params]);
        }
      }
    } as IVeoMutationDefinition<IVeoDeleteUnitParameters, void>
  }
} as IVeoQueryDefinitions;

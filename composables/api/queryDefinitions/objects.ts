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
import { omit } from "lodash";
import { getEntityDetailsFromLink } from "~/lib/utils";
import { IVeoAPIMessage, IVeoDecisionEvaluation, IVeoEntity, IVeoPaginatedResponse, IVeoPaginationOptions, IVeoRisk } from "~/types/VeoTypes";
import { IVeoMutationDefinition } from "../utils/mutation";
import { IVeoQueryDefinition } from "../utils/query";
import { VeoApiReponseType } from "../utils/request";

const route = useRoute();

export interface IVeoFetchObjectsParameters extends IVeoPaginationOptions {
  domain: string;
  unit: string;
  endpoint: string;
  displayName?: string;
  subType?: string;
  childElementIds?: string;
}

export interface IVeoFetchObjectParameters {
  domain: string | string[];
  endpoint: string;
  id: string;
}

export interface IVeoFetchObjectChildrenParameters {
  domain: string;
  endpoint: string;
  id: string;
}

export interface IVeoFetchScopeChildrenParameters {
  domain: string;
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
  domain: string;
  endpoint: string;
  object: IVeoEntity;
  parentScopes?: string[];
}

export interface IVeoUpdateObjectParameters {
  id: string;
  domain: string;
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

export interface IVeoUpdateRiskParameters {
  endpoint: string;
  id: string;
  scenarioId: string;
  risk: IVeoRisk;
}

export interface IVeoDeleteRiskParameters {
  endpoint: string;
  objectId: string;
  scenarioId: string;
}

export interface IVeoFetchWipDecisionEvaluationParameters{
  endpoint: string;
  object: IVeoEntity;
  id: string;
  domain: string;
}

export const formatObject = (object: any) => {
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
  object.displayName = [object.designator, object.abbreviation, object.name].filter((part) => part).join(' ');
  return object;
};

export default {
  queries:{
    fetchAll:{
      primaryQueryKey: 'objects',
      url: '/api/domains/:domain/:endpoint',
      onDataFetched: (result) => {
        result.items.map((item) => formatObject(item));

        // +1, because the first page for the api is 0, however vuetify expects it to be 1
        result.page = result.page + 1;
        return result;
      },
      queryParameterTransformationFn:(queryParameters) => ({
        params: {
          domain: route.params.domain,
          endpoint: queryParameters.endpoint
        },
        query: {
          hasParentElements: queryParameters.hasNoParentElements === true ? false : undefined, // The frontend only works with hasNoParentElements, but the backend expects hasParentElements
          ...omit(queryParameters, 'endpoint')
        }
      })
    } as IVeoQueryDefinition<IVeoFetchObjectsParameters, IVeoPaginatedResponse<IVeoEntity[]>>,
    fetch:{
      primaryQueryKey: 'object',
      url: '/api/domains/:domain/:endpoint/:id',
      onDataFetched: (result) => formatObject(result),
      queryParameterTransformationFn:(queryParameters) => ({ params: { domain: route.params.domain, endpoint: queryParameters.endpoint, id: queryParameters.id } })
    } as IVeoQueryDefinition<IVeoFetchObjectParameters, IVeoEntity>,
    fetchObjectChildren:{
      primaryQueryKey: 'childObjects',
      url: '/api/domains/:domain/:endpoint/:id/parts',
      onDataFetched: (result) => (result.items || []).map((item) => formatObject(item)),
      queryParameterTransformationFn:(queryParameters) => ({ params: { domain: route.params.domain, endpoint: queryParameters.endpoint, id: queryParameters.id } })
    } as IVeoQueryDefinition<IVeoFetchObjectChildrenParameters, IVeoEntity[]>,
    fetchScopeChildren:{
      primaryQueryKey: 'childScopes',
      url: '/api/domains/:domain/scopes/:id/members',
      onDataFetched: (result) => (result.items || []).map((item) => formatObject(item)),
      queryParameterTransformationFn:(queryParameters) => ({ params: { domain: route.params.domain, id: queryParameters.id } })
    } as IVeoQueryDefinition<IVeoFetchScopeChildrenParameters, IVeoEntity[]>,
    fetchRisks:{
      primaryQueryKey: 'risks',
      url: '/api/:endpoint/:id/risks',
      queryParameterTransformationFn: (queryParameters) => ({ params: queryParameters })
    } as IVeoQueryDefinition<IVeoFetchRisksParameters, IVeoRisk[]>,
    fetchRisk:{
      primaryQueryKey: 'risk',
      url: '/api/:endpoint/:id/risks/:scenarioId',
      queryParameterTransformationFn: (queryParameters) => ({ params: { id: queryParameters.objectId, endpoint: queryParameters.endpoint, scenarioId: queryParameters.scenarioId } })
    } as IVeoQueryDefinition<IVeoFetchRiskParameters, IVeoRisk>,
    fetchWipDecisionEvaluation: {
      primaryQueryKey: 'evaluation',
      url: '/api/domains/:domain/:endpoint/evaluation',
      queryParameterTransformationFn: (queryParameters) => ({
        params: {
          id: queryParameters.object.id,
          domain: route.params.domain,
          endpoint: queryParameters.endpoint
        },
        query: {
          domain: queryParameters.domain
        },
        json: queryParameters.object}),
      staticQueryOptions: {
        method: 'POST'
      }
    } as IVeoQueryDefinition<IVeoFetchWipDecisionEvaluationParameters,IVeoDecisionEvaluation>
  },
  mutations:{
    createObject:{
      primaryQueryKey: 'object',
      url: '/api/domains/:domain/:endpoint',
      method: 'POST',
      mutationParameterTransformationFn: (mutationParameters) => {
        const _object = mutationParameters.object;
        // Remove properties of the object only used in the frontend
        if (_object.type === 'scope') {
          // @ts-ignore Is only set in DTO if object is any type expect scope
          delete _object.parts;
        } else {
          // @ts-ignore Is only set in DTO if object is of type scope
          delete _object.members;
        }
        return { params: { domain: route.params.domain, endpoint: mutationParameters.endpoint },
          query: { scopes: mutationParameters.parentScopes?.join(',') }, json: _object };
      },
      staticMutationOptions: {
        onSuccess: (queryClient, _data, _variables, _context) => {
          queryClient.invalidateQueries(['objects']);
        }
      }
    } as IVeoMutationDefinition<IVeoCreateObjectParameters, IVeoAPIMessage>,
    updateObject: {
      primaryQueryKey: 'object',
      url: '/api/domains/:domain/:endpoint/:id',
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
      },
      mutationParameterTransformationFn: (mutationParameters) => {
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
        return { params: { domain: route.params.domain, endpoint: mutationParameters.endpoint, id: mutationParameters.object.id }, json: _object };
      },
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries({queryKey: ['evaluation']});
          queryClient.invalidateQueries(['objects']);
          queryClient.invalidateQueries([
            'object',
            {
              endpoint: variables.params?.endpoint,
              id: variables.params?.id
            }
          ]);
          queryClient.invalidateQueries([
            'childObjects',
            {
              endpoint: variables.params?.endpoint,
              id: variables.params?.id
            }
          ]);
          queryClient.invalidateQueries([
            'childScopes',
            {
              id: variables.params?.id
            }
          ]);
          queryClient.invalidateQueries(['objects']); // Invalid all object lists, as the parent endpoint uses the same key (and we want an updated edit date in the list for this object)
          setTimeout(() => {
            queryClient.invalidateQueries(['versions']);
          }, 5000); // Only invalidate after 5 seconds, as the history sevice isn't updated as sonn as the object is updated
        }
      }
    } as IVeoMutationDefinition<IVeoUpdateObjectParameters, IVeoEntity>,
    // DELETE isn't processed by the multi-domain-API as opposed to create, read and update
    deleteObject:{
      primaryQueryKey: 'object',
      url: '/api/:endpoint/:id',
      method: 'DELETE',
      reponseType: VeoApiReponseType.VOID,
      mutationParameterTransformationFn: (mutationParameters) => ({ params: mutationParameters }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries(['objects']);
          queryClient.invalidateQueries(['object', variables.params]);
        }
      }
    } as IVeoMutationDefinition<IVeoDeleteObjectParameters, void>,
    createRisk:{
      primaryQueryKey: 'risk',
      url: '/api/:endpoint/:objectId/risks',
      method: 'POST',
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: { endpoint: mutationParameters.endpoint, objectId: mutationParameters.objectId },
        json: mutationParameters.risk
      }),
      staticMutationOptions: {
        onSuccess: ( queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries({ queryKey: ['risks'] });
          queryClient.invalidateQueries({ queryKey: [
            'risk',
            {
              scenarioId: getEntityDetailsFromLink(variables.json.scenario).id,
              objectId: variables.params?.objectId,
              endpoint: variables.params?.endpoint
            }
          ]});
          queryClient.invalidateQueries({queryKey: ['evaluation']});
        }
      }
    } as IVeoMutationDefinition<IVeoCreateRiskParameters, IVeoRisk>,
    updateRisk:{
      primaryQueryKey: 'risk',
      url: '/api/:endpoint/:id/risks/:scenarioId',
      method: 'PUT',
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: { endpoint: mutationParameters.endpoint, id: mutationParameters.id, scenarioId: mutationParameters.scenarioId },
        json: mutationParameters.risk
      }),
      staticMutationOptions: {
        onSuccess: ( queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries({ queryKey: ['risks'] });
          queryClient.invalidateQueries({ queryKey: [
            'risk',
            {
              endpoint: variables.params?.endpoint,
              objectId: variables.params?.id,
              scenarioId: variables.params?.scenarioId
            }
          ]});
          queryClient.invalidateQueries({queryKey: ['evaluation']});
        }
      }
    } as IVeoMutationDefinition<IVeoUpdateRiskParameters, IVeoRisk>,
    deleteRisk: {
      primaryQueryKey: 'risk',
      url: '/api/:endpoint/:objectId/risks/:scenarioId',
      method: 'DELETE',
      reponseType: VeoApiReponseType.VOID,
      mutationParameterTransformationFn: (mutationParameters) => ({ params: mutationParameters }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries([
            'risks',
            {
              endpoint: variables.params?.endpoint,
              id: variables.params?.objectId
            }
          ]),
          queryClient.invalidateQueries({queryKey: ['evaluation']});
        }
      }
    } as IVeoMutationDefinition<IVeoDeleteRiskParameters, void>
  }
};

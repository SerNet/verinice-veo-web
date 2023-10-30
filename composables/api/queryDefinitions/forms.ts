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
import { IVeoTranslationCollection } from "~/types/VeoTypes";
import { IVeoMutationDefinition } from "../utils/mutation";
import { IVeoQueryDefinition, STALE_TIME } from "../utils/query";
import application from "../../../components/schema/application.json";
import contract from "../../../components/schema/contract.json";
import controller from "../../../components/schema/controller.json";
import data_privacy_incident from "../../../components/schema/data_privacy_incident.json";
import data_processing from "../../../components/schema/data_processing.json";
import data_protection_impact_assesment from "../../../components/schema/data_protection_impact_assesment.json";
import data_protection_officer from "../../../components/schema/data_protection_officer.json";
import data_transfer from "../../../components/schema/data_transfer.json";
import datatype from "../../../components/schema/datatype.json";
import document from "../../../components/schema/document.json";
import it_system from "../../../components/schema/it_system.json";
import joint_controllership from "../../../components/schema/joint_controllership.json";
import person from "../../../components/schema/person.json";
import processor from "../../../components/schema/processor.json";
import request_data_subject from "../../../components/schema/request_data_subject.json";
import responsible_body from "../../../components/schema/responsible_body.json";
import scenario from "../../../components/schema/scenario.json";
import scope from "../../../components/schema/scope.json";
import tom from "../../../components/schema/tom.json";

export interface IVeoFormSchemaMeta {
  modelType: string;
  subType: string;
  name: { [key: string]: string };
  id?: string;
  domainId?: string;
  sorting: string | null;
}

export interface IVeoFormSchemaItemOptions {
  label?: string;
  format?: string;
  direction?: string;
  class?: string;
}

export interface IVeoFormSchemaItemRule {
  effect: 'SHOW' | 'HIDE';
  condition: {
    scope: string;
    schema: { enum: (string | boolean | number)[] };
  };
}

export type IVeoFormSchemaContentType = 'Layout' | 'Control' | 'Label' | 'Widget';

export interface IVeoFormSchemaItem {
  type: IVeoFormSchemaContentType;
  scope?: string;
  text?: string;
  options: IVeoFormSchemaItemOptions;
  elements?: IVeoFormSchemaItem[];
  rule?: IVeoFormSchemaItemRule;
  name?: string;
}

export interface IVeoFormSchemaTranslationCollection {
  [key: string]: IVeoTranslationCollection;
}

export interface IVeoFormSchema extends IVeoFormSchemaMeta {
  content: IVeoFormSchemaItem;
  translation: IVeoFormSchemaTranslationCollection;
}

export interface IVeoFetchFormsParameters {
  domainId: string;
}

export interface IVeoFetchFormParameters {
  domainId: string;
  id: string;
}

export interface IVeoCreateFormParameters {
  domainId: string;
  form: IVeoFormSchema;
}

export interface IVeoUpdateFormParameters {
  id: string;
  domainId: string;
  form: IVeoFormSchema;
}

export default {
  queries: {
    fetchForms: {
      primaryQueryKey: 'forms',
      url: '/api/forms',
      queryParameterTransformationFn: (queryParameters) => ({ query: queryParameters }),
      staticQueryOptions: {
        staleTime: STALE_TIME.MEDIUM,
        placeholderData: []
      }
    } as IVeoQueryDefinition<IVeoFetchFormsParameters, IVeoFormSchemaMeta[]>,
    fetchForm: {
      primaryQueryKey: 'form',
      url: '/api/forms/:id',
      onDataFetched: (result, queryParameters) => {
        switch (queryParameters.params.id) {
          // responsible body
          case '5d545f74-bca8-4553-87d4-e2939351ef8d':
            result = responsible_body;
            break;
          case '6435c167-4096-438a-9c6a-32d55cff88f1':
            result = processor;
            break;
          case '3e0f2488-8713-4791-8a7e-c83577ae708c':
            result = controller;
            break;
          case 'd4b15251-af6d-4d95-895d-323d316da237':
            result = joint_controllership;
            break;
          case '41e9ab50-357e-4aed-a1e0-8915e3d427be':
            result = scope;
            break;
          case '44d5a9fd-6f5f-4935-8d85-b6b0bce1f7e9':
            result = data_processing;
            break;
          case 'ef130847-aa61-488b-a70e-ba3fa6b77b5c':
            result = data_transfer;
            break;
          case 'a22ec36a-3b4c-4ce5-8a5d-67e4c6cc796f':
            result = data_protection_impact_assesment;
            break;
          case 'fe481ecf-6fba-429d-86ce-58a4bbec599a':
            result = datatype;
            break;
          case 'bbecddf0-7a75-48fc-8dba-b15a74409e82':
            result = application;
            break;
          case '8a94db47-b73d-4a82-9dfd-f166b169d95b':
            result = it_system;
            break;
          case 'd3e926f5-1762-4b3e-8412-8c4657c069fc':
            result = data_protection_officer;
            break;
          case '1e8c9fa2-5ec5-4b44-b1e4-04a12a7f79b3':
            result = person;
            break;
          case 'cd4a524e-a91d-49bf-bfc7-6ed9cc205889':
            result = tom;
            break;
          case '515c1691-4ebe-43d2-8387-a8d8c96fe2a0':
            result = scenario;
            break;
          case '47336b5a-4c0b-416d-a345-4ef8a3ffd7d2':
            result = contract;
            break;
          case '90d89860-a8de-40cd-97f6-2dcc2290e6d1':
            result = document;
            break;
          case 'f63f0d1b-16eb-4220-866f-21c378009dec':
            result = request_data_subject;
            break;
          case '76bc9036-6c3b-499a-b385-09b66c6ac7d9':
            result = data_privacy_incident;
            break;
          default:
            throw new Error('');
        }
        return result;
      },
      queryParameterTransformationFn: (queryParameters) => ({
        params: {
          id: queryParameters.id
        },
        query: {
          domainId: queryParameters.domainId
        }
      }),
      staticQueryOptions: {
        staleTime: STALE_TIME.MEDIUM
      }
    } as IVeoQueryDefinition<IVeoFetchFormParameters, IVeoFormSchema>
  },
  mutations: {
    createForm: {
      primaryQueryKey: 'form',
      url: '/api/forms',
      method: 'POST',
      mutationParameterTransformationFn: (mutationParameters) => ({
        json: { domainId: mutationParameters.domainId, ...mutationParameters.form }
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, _variables, _context) => {
          queryClient.invalidateQueries(['forms']);
        }
      }
    } as IVeoMutationDefinition<IVeoCreateFormParameters, string>,
    updateForm: {
      primaryQueryKey: 'form',
      url: '/api/forms/:id',
      method: 'PUT',
      mutationParameterTransformationFn: (mutationParameters) => ({
        params: {
          id: mutationParameters.id
        },
        json: { domainId: mutationParameters.domainId, ...mutationParameters.form }
      }),
      staticMutationOptions: {
        onSuccess: (queryClient, _data, variables, _context) => {
          queryClient.invalidateQueries([
            'form',
            {
              domainId: variables.params?.domainId || '',
              id: variables.params?.id || ''
            }
          ]);
          queryClient.invalidateQueries(['forms', { domainId: variables.query?.domainId || '' }]);
        }
      }
    } as IVeoMutationDefinition<IVeoUpdateFormParameters, void>
  }
};

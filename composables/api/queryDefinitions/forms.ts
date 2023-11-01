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

// temporarily checking in forms for testing purposes only
// DS-GVO
import application from "../../../components/schema/dsgvo/application.json";
import contract from "../../../components/schema/dsgvo/contract.json";
import controller from "../../../components/schema/dsgvo/controller.json";
import data_privacy_incident from "../../../components/schema/dsgvo/data_privacy_incident.json";
import data_processing from "../../../components/schema/dsgvo/data_processing.json";
import data_protection_impact_assesment from "../../../components/schema/dsgvo/data_protection_impact_assesment.json";
import data_protection_officer from "../../../components/schema/dsgvo/data_protection_officer.json";
import data_transfer from "../../../components/schema/dsgvo/data_transfer.json";
import datatype from "../../../components/schema/dsgvo/datatype.json";
import document from "../../../components/schema/dsgvo/document.json";
import it_system from "../../../components/schema/dsgvo/it_system.json";
import joint_controllership from "../../../components/schema/dsgvo/joint_controllership.json";
import person from "../../../components/schema/dsgvo/person.json";
import processor from "../../../components/schema/dsgvo/processor.json";
import request_data_subject from "../../../components/schema/dsgvo/request_data_subject.json";
import responsible_body from "../../../components/schema/dsgvo/responsible_body.json";
import scenario from "../../../components/schema/dsgvo/scenario.json";
import scope from "../../../components/schema/dsgvo/scope.json";
import tom from "../../../components/schema/dsgvo/tom.json";
// IT-GS
import itgs_application from "../../../components/schema/itgs/application.json";
import itgs_business_process from "../../../components/schema/itgs/business_process.json";
import itgs_document from "../../../components/schema/itgs/document.json";
import itgs_elementary_threat from "../../../components/schema/itgs/elementary_threat.json";
import itgs_ics_system from "../../../components/schema/itgs/ics_system.json";
import itgs_information_domain from "../../../components/schema/itgs/information_domain.json";
import itgs_information_security_incident from "../../../components/schema/itgs/information_security_incident.json";
import itgs_information from "../../../components/schema/itgs/information.json";
import itgs_institution from "../../../components/schema/itgs/institution.json";
import itgs_iot_system from "../../../components/schema/itgs/iot_system.json";
import itgs_it_system from "../../../components/schema/itgs/it_system.json";
import itgs_module from "../../../components/schema/itgs/module.json";
import itgs_network_plan from "../../../components/schema/itgs/network_plan.json";
import itgs_network from "../../../components/schema/itgs/network.json";
import itgs_outsourcing_provider from "../../../components/schema/itgs/outsourcing_provider.json";
import itgs_outsourcing_users from "../../../components/schema/itgs/outsourcing_users.json";
import itgs_person from "../../../components/schema/itgs/person.json";
import itgs_reference_document from "../../../components/schema/itgs/reference_document.json";
import itgs_requirement from "../../../components/schema/itgs/requirement.json";
import itgs_room from "../../../components/schema/itgs/room.json";
import itgs_safeguard from "../../../components/schema/itgs/safeguard.json";
import itgs_scope from "../../../components/schema/itgs/scope.json";
import itgs_specialist_methodologies from "../../../components/schema/itgs/specialist_methodologies.json";

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
          case '8a87f04b-8528-472c-a6c2-092350e95e29':
            result = itgs_application;
            break;
          case '358a8880-e243-4de2-9443-02267200be78':
            result = itgs_business_process;
            break;
          case '00e8d8df-9460-44a3-8180-fc83c23b69e0':
            result = itgs_document;
            break;
          case '3f1d148b-baea-448c-b476-11bdb4ef60d8':
            result = itgs_elementary_threat;
            break;
          case '662abf1f-afff-43a1-8e8e-649525b56691':
            result = itgs_ics_system;
            break;
          case '1abed95f-4d73-4f77-b7e4-6362cbcd3239':
            result = itgs_information_domain;
            break;
          case 'f68e2999-14e1-4d48-b9f8-5cc4dfc50053':
            result = itgs_information_security_incident;
            break;
          case '168e587a-da33-4811-83d4-cf28d0b41a1b':
            result = itgs_information;
            break;
          case '0cf96b05-4231-4bbb-acdc-838ac2a47686':
            result = itgs_institution;
            break;
          case '0374e3ec-7135-4123-a359-3330abbaf95e':
            result = itgs_iot_system;
            break;
          case 'e0c04451-0a1a-4dab-b1ec-997d55379859':
            result = itgs_it_system;
            break;
          case 'eecfbd97-03b5-455a-8cfc-859ab7c944e8':
            result = itgs_module;
            break;
          case 'fadb6a01-4d41-40c8-90e0-704fcae73f34':
            result = itgs_network_plan;
            break;
          case 'a9f8806d-1abc-4b94-807a-a67892496e03':
            result = itgs_network;
            break;
          case '5255228d-3a87-4c5d-8d33-d1016efce0c6':
            result = itgs_outsourcing_provider;
            break;
          case '9a9c156a-577b-44ca-b191-abf0021ab1c4':
            result = itgs_outsourcing_users;
            break;
          case '46ef714d-647a-4795-a00b-3a9b7102284c':
            result = itgs_person;
            break;
          case '517001e6-2ac4-4afa-a0c9-4d6d12fd4ad1':
            result = itgs_reference_document;
            break;
          case 'b464de9e-d271-4edb-a194-efe25b577341':
            result = itgs_requirement;
            break;
          case 'b1308704-7ed4-4564-a155-2686ad59b42e':
            result = itgs_room;
            break;
          case 'b6dc4ed6-142d-429c-8630-5dee823bda27':
            result = itgs_safeguard;
            break;
          case 'd9ecc2df-ac7b-4189-92c2-54f79c0451c0':
            result = itgs_scope;
            break;
          case 'cf64d3f0-14ab-457d-85a5-241a2c4b9471':
            result = itgs_specialist_methodologies;
            break;
          default:
            throw new Error('__FORMS__: No ID provided!');
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

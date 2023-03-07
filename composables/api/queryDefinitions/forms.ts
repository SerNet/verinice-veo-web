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
import { IVeoTranslationCollection } from "~~/types/VeoTypes";
import { IVeoMutationDefinition } from "../utils/mutation";
import { IVeoQueryDefinition, IVeoQueryDefinitions, STALE_TIME } from "../utils/query";

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

export type IVeoFormSchemaContentType = 'Layout' | 'Control' | 'Label' | string;

export interface IVeoFormSchemaItem {
  type: IVeoFormSchemaContentType;
  scope?: string;
  text?: string;
  options: IVeoFormSchemaItemOptions;
  elements?: IVeoFormSchemaItem[];
  rule?: IVeoFormSchemaItemRule;
  formSchemaPointer?: string;
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
      url: '/api/forms/',
      queryParameterTransformationFn: (queryParameters) => ({ query: queryParameters }),
      staticQueryOptions: {
        staleTime: STALE_TIME.MEDIUM,
        placeholderData: []
      }
    } as IVeoQueryDefinition<IVeoFetchFormsParameters, IVeoFormSchemaMeta[]>,
    fetchForm: {
      primaryQueryKey: 'form',
      url: '/api/forms/:id',
      onDataFetched: (result, queryParameters) => JSON.parse(JSON.stringify(result).replaceAll('{CURRENT_DOMAIN_ID}', queryParameters.params?.domainId)),
      queryParameterTransformationFn: (queryParameters) => ({
        params: {
          id: queryParameters.id
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
} as IVeoQueryDefinitions;

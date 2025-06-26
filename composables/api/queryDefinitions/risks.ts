/*
 * verinice.veo web
 * Copyright (C) 2025 jae
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
import { IVeoAPIMessage } from '~/types/VeoTypes';
import { IVeoMutationDefinition } from '../utils/mutation';

export interface IVeoUpdateRiskMatrixValuesParameters {
  domainId: string;
  riskDefinitionId: string;
  json: unknown;
}

export default {
  queries: {
    evaluation: {
      primaryQueryKey: 'risk-definition-evaluation',
      url: `/api/content-customizing/domains/:domainId/risk-definitions/:riskDefinitionId/evaluation`,
      method: 'POST',
      queryParameterTransformationFn: (params) => ({
        params: {
          domainId: params.domainId,
          riskDefinitionId: params.riskDefinitionId
        },
        json: params.riskDefinition
      })
    }
  },
  mutations: {
    update: {
      primaryQueryKey: 'matrixValues',
      url: `/api/content-customizing/domains/:domainId/risk-definitions/:riskDefinitionId`,
      method: 'PUT',
      mutationParameterTransformationFn: (params) => ({
        params: {
          domainId: params.domainId,
          riskDefinitionId: params.riskDefinitionId
        },
        json: params.json
      }),

      staticMutationOptions: {
        onSuccess: (queryClient, _data, _variables, _context) => {
          queryClient.invalidateQueries(['domain']);
        }
      }
    } as IVeoMutationDefinition<IVeoUpdateRiskMatrixValuesParameters, IVeoAPIMessage>
  }
};

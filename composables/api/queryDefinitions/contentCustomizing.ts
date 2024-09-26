/*
 * verinice.veo web
 * Copyright (C) 2024 jae
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */

import { IVeoAPIMessage } from '~/types/VeoTypes';
import { IVeoMutationDefinition } from '../utils/mutation';
export interface IVeoCustomizeContentParameters {
  domainId: string;
  riskDefinitionId: string;
}

export default {
  mutations: {
    updateRiskDefinitions: {
      primaryQueryKey: 'riskDefinitions',
      url: '/api/content-customizing/domains/:domainId/risk-definitions/:riskDefinitionId',
      method: 'PUT',
      mutationParameterTransformationFn: (mutationParameters: any) => {
        return {
          params: {
            domainId: mutationParameters.domainId,
            riskDefinitionId: mutationParameters.riskDefinitionId
          },
          json: mutationParameters.riskDefinition
        };
      },
      staticMutationOptions: {
        onSuccess: (queryClient, _data, _variables, _context) => {
          // Currently risk definitions have to be fetched as part of the domain
          // Thus we refetch the domain after updating a risk definition
          queryClient.invalidateQueries(['domain']);
        }
      }
    } as IVeoMutationDefinition<IVeoCustomizeContentParameters, IVeoAPIMessage>
  }
};

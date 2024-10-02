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

import { cloneDeep } from 'lodash';
import type { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
import { IVeoRiskDefinition } from '~/types/VeoTypes';

type TVeoRiskDefintionPart = {
  ordinalValue: number;
  htmlColor: string;
  translations: Array<
    Record<
      string,
      {
        name: string;
        description: string;
      }
    >
  >;
};

export type TRiskDefinitionPart = {
  type: 'riskValues' | 'probability' | 'categories';
  typeTranslation: string;
  items: TVeoRiskDefintionPart[];
  riskCategoryId?: string;
};

export function getRiskDefinition(domain: IVeoDomain, riskDefinitionId: string) {
  const riskDefinition = domain?.riskDefinitions?.[riskDefinitionId];
  if (!riskDefinition) throw new Error(`Could not find risk definition with an ID of "${riskDefinitionId}".`);
  return cloneDeep(riskDefinition);
}

export function createNewRiskDefinition({ currentRiskDefinition, newRiskDefinitionPart }) {
  return {
    riskValues: () => updateRiskValues(currentRiskDefinition, newRiskDefinitionPart),
    probability: () => updateProbabilities(currentRiskDefinition, newRiskDefinitionPart),
    potentialImpacts: () => updatePotentialImpacts(currentRiskDefinition, newRiskDefinitionPart),
    default: () => currentRiskDefinition
  }[newRiskDefinitionPart.type ?? 'default']();
}

function updateRiskValues(riskDefinition: IVeoRiskDefinition, newRiskDefintionPart: TRiskDefinitionPart) {
  return {
    ...riskDefinition,
    riskValues: newRiskDefintionPart.items
  };
}

function updateProbabilities(riskDefinition: IVeoRiskDefinition, newRiskDefintionPart: TRiskDefinitionPart) {
  return {
    ...riskDefinition,
    probability: {
      ...riskDefinition.probability,
      levels: newRiskDefintionPart.items
    }
  };
}

function updatePotentialImpacts(riskDefinition: IVeoRiskDefinition, newRiskDefintionPart: TRiskDefinitionPart) {
  const categories = riskDefinition.categories.map((category) => {
    if (category.id == newRiskDefintionPart.riskCategoryId) {
      return {
        ...category,
        potentialImpacts: newRiskDefintionPart.items
      };
    }
    return category;
  });

  return {
    ...riskDefinition,
    categories
  };
}

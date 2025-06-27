/*
 * verinice.veo web
 * Copyright (C) 2025  Aziz Khalledi
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
import { cloneDeep } from 'lodash';

import type { IVeoRiskCategory } from '~/types/VeoTypes';

/**
 * Dynamically updates the risk definitions in the form schema based on the current domain data.
 * This function can be called on the client side to display the latest risk definitions.
 */
export function updateRiskDefinitionsFormSchema(domain: any, formSchema: any, locale: any) {
  if (!domain || !formSchema || !domain.riskDefinitions) return formSchema;

  try {
    const updatedFormSchema = cloneDeep(formSchema);

    // Iterate over risk definitions
    const riskDefinitionName = Object.keys(domain.riskDefinitions)[0];
    const categories = domain.riskDefinitions[riskDefinitionName]?.categories || [];

    // Lookup impact groups in form
    findAndUpdateImpactsElements(updatedFormSchema, categories, riskDefinitionName, locale);

    return updatedFormSchema;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Risikodefinitionen:', error);
    return formSchema;
  }
}

/**
 * Recursively search for and update all Impacts elements in the form schema
 */
function findAndUpdateImpactsElements(
  element: any,
  categories: IVeoRiskCategory[],
  riskDefinitionName: string,
  locale: any
) {
  // Check if this element is an Impacts element
  if (element?.type === 'Layout' && element?.options?.format == 'impactGroup') {
    // Update the Impacts children based on the current risk categories
    updateImpactsElement(element, categories, riskDefinitionName, locale);
  }

  // Recursive call for all child elements
  if (element?.elements && Array.isArray(element.elements)) {
    element.elements.forEach((child: any) =>
      findAndUpdateImpactsElements(child, categories, riskDefinitionName, locale)
    );
  }
}

/**
 * Updates the child elements of an Impacts element with the current risk categories
 */
function updateImpactsElement(element: any, categories: IVeoRiskCategory[], riskDefinitionName: string, locale: any) {
  const getTranslationsFromCategory = (category: IVeoRiskCategory) => {
    return Object.keys(category.translations).reduce(
      (acc: Record<string, string>, locale) => {
        acc[locale] = category.translations[locale]?.name || '';
        return acc;
      },
      {} as Record<string, string>
    );
  };

  element.elements = categories.map((category) => ({
    type: 'Layout',
    options: {
      format: 'accordion',
      label: getTranslationsFromCategory(category)[locale] || ''
    },
    elements: [
      {
        scope: `#/properties/riskValues/properties/${riskDefinitionName}/properties/potentialImpacts/properties/${category.id}/properties/potentialImpactsCalculated`,
        type: 'Control',
        options: {
          label: '#lang/potentialImpactsCalculated'
        }
      },
      {
        type: 'Layout',
        options: {
          format: 'group',
          direction: 'horizontal'
        },
        elements: [
          {
            scope: `#/properties/riskValues/properties/${riskDefinitionName}/properties/potentialImpacts/properties/${category.id}/properties/potentialImpacts`,
            type: 'Control',
            options: {
              label: '#lang/potentialImpacts'
            }
          },
          {
            type: 'Control',
            scope: `#/properties/riskValues/properties/${riskDefinitionName}/properties/potentialImpacts/properties/${category.id}/properties/potentialImpactReasons`,
            options: {
              label: '#lang/potentialImpactReasons'
            }
          }
        ]
      },
      {
        scope: `#/properties/riskValues/properties/${riskDefinitionName}/properties/potentialImpacts/properties/${category.id}/properties/potentialImpactsEffective`,
        type: 'Control',
        options: {
          label: '#lang/potentialImpactsEffective'
        }
      },
      {
        scope: `#/properties/riskValues/properties/${riskDefinitionName}/properties/potentialImpacts/properties/${category.id}/properties/potentialImpactExplanations`,
        type: 'Control',
        options: {
          label: '#lang/potentialImpactExplanations'
        }
      }
    ],
    description: {
      title: 'Impact Group',
      name: getTranslationsFromCategory(category)[locale] || '',
      color: 'purple darken-2'
    }
  }));
}

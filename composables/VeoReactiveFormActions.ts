/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann
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
import { trim } from 'lodash';

import { IVeoFormsReactiveFormActions } from '~/components/dynamic-form/types';

export function useVeoReactiveFormActions() {
  const route = useRoute();

  const domainId = computed(() => route.params.domain as string);

  function defaultReactiveFormActions(): IVeoFormsReactiveFormActions {
    return domainId.value ?
        {
          [`#/properties/subType`]: [
            (newValue, _oldValue, newObject, _oldObject) => {
              if (domainId.value && !!newValue) {
                delete newObject.status;
              }
              return newObject;
            }
          ]
        }
      : {};
  }

  function personReactiveFormActions(): IVeoFormsReactiveFormActions {
    return {
      '#/properties/customAspects/properties/person_generalInformation/properties/attributes/properties/person_generalInformation_givenName':
        [(_newValue, _oldValue, newObject, oldObject) => getFullName(newObject, oldObject)],
      '#/properties/customAspects/properties/person_generalInformation/properties/attributes/properties/person_generalInformation_familyName':
        [(_newValue, _oldValue, newObject, oldObject) => getFullName(newObject, oldObject)]
    };
  }

  function riskReactiveFormActions(riskAnalysisType: string, protectionGoals: string[]): IVeoFormsReactiveFormActions {
    return protectionGoals.reduce(
      (newRiskValues, category) => {
        newRiskValues[
          `#/properties/riskValues/properties/${riskAnalysisType}/properties/potentialImpacts/properties/${category}/properties/potentialImpacts`
        ] = [
          (newValue, _oldValue, newObject, _oldObject) => {
            const impacts = newObject.riskValues[riskAnalysisType].potentialImpacts[category];
            // if no user specification (newValue) is given ...
            if (newValue === undefined) {
              // ... unset the impact reason and the explanation
              impacts.potentialImpactReasons = undefined;
              impacts.potentialImpactExplanations = undefined;
              // ... and provide a fallback for 'effective'
              impacts.potentialImpactsEffective = impacts.potentialImpactsCalculated;
              impacts.potentialImpactEffectiveReasons =
                impacts.potentialImpact ? 'impact_method_high_water_mark' : undefined;
            } else {
              // 'effective' inherits the value from user specification
              impacts.potentialImpactsEffective = newValue;
              // set the default val for the reason to 'manual' if not set yet
              if (impacts.potentialImpactReasons === undefined) {
                impacts.potentialImpactReasons = 'impact_reason_manual';
              }
              if (impacts.potentialImpactEffectiveReasons === undefined) {
                impacts.potentialImpactEffectiveReasons = impacts.potentialImpactReasons;
              }
            }
            return newObject;
          }
        ];
        return newRiskValues;
      },
      {} as Record<string, any>
    );
  }

  /*
   Helpers for previously defined reactive form actions
  
  */
  function getFullName(newObject: Record<string, any>, oldObject: Record<string, any>) {
    let fullnameOld = '';
    let givenNameOld = '';
    let familyNameOld = '';
    let givenNameNew = '';
    let familyNameNew = '';

    try {
      fullnameOld = oldObject?.name;
    } catch (_e) {
      // If the name couldn't be found, simply do nothing
    }
    try {
      givenNameOld =
        oldObject?.customAspects?.person_generalInformation?.attributes?.person_generalInformation_givenName;
    } catch (_e) {
      // If the above action fails, no further action is required
    }
    try {
      familyNameOld =
        oldObject?.customAspects?.person_generalInformation?.attributes?.person_generalInformation_familyName;
    } catch (_e) {
      // If the above action fails, no further action is required
    }
    try {
      givenNameNew =
        newObject?.customAspects?.person_generalInformation?.attributes?.person_generalInformation_givenName;
    } catch (_e) {
      // If the above action fails, no further action is required
    }
    try {
      familyNameNew =
        newObject?.customAspects?.person_generalInformation?.attributes?.person_generalInformation_familyName;
    } catch (_e) {
      // If the above action fails, no further action is required
    }

    // Check whether the fullname has the same value as the computed fullname (wasn't overridden by the user)
    const computedFullNameOld = trim(`${givenNameOld} ${familyNameOld}`);
    const computedFullNameNew = trim(`${givenNameNew} ${familyNameNew}`);

    if (fullnameOld === computedFullNameOld || fullnameOld === '' || fullnameOld === undefined) {
      newObject.name = computedFullNameNew;
    }
    return newObject;
  }

  return {
    defaultReactiveFormActions,
    personReactiveFormActions,
    riskReactiveFormActions
  };
}

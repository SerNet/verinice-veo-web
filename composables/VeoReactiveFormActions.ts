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
import { computed, useRoute } from '@nuxtjs/composition-api';
import { trim } from 'lodash';
import vjp from 'vue-json-pointer';

import { IVeoFormsReactiveFormActions } from '~/components/forms/types';
import { IBaseObject, separateUUIDParam } from '~/lib/utils';

export function useVeoReactiveFormActions() {
  const route = useRoute();

  const domainId = computed(() => separateUUIDParam(route.value.params.domain).id);

  function defaultReactiveFormActions(): IVeoFormsReactiveFormActions {
    return domainId.value
      ? {
          [`#/properties/domains/properties/${domainId.value}/properties/subType`]: [
            (newValue, _oldValue, newObject, _oldObject) => {
              if (domainId.value && !!newValue) {
                delete newObject.domains[domainId.value].status;
              }
              return newObject;
            }
          ]
        }
      : {};
  }

  function personReactiveFormActions(): IVeoFormsReactiveFormActions {
    return {
      '#/properties/customAspects/properties/person_generalInformation/properties/attributes/properties/person_generalInformation_givenName': [
        (_newValue, _oldValue, newObject, oldObject) => getFullName(newObject, oldObject)
      ],
      '#/properties/customAspects/properties/person_generalInformation/properties/attributes/properties/person_generalInformation_familyName': [
        (_newValue, _oldValue, newObject, oldObject) => getFullName(newObject, oldObject)
      ]
    };
  }

  /*
   Helpers for previously defined reactive form actions
  
  */
  function getFullName(newObject: IBaseObject, oldObject: IBaseObject) {
    let fullnameOld = '';
    let givenNameOld = '';
    let familyNameOld = '';
    let givenNameNew = '';
    let familyNameNew = '';

    try {
      fullnameOld = vjp.get(oldObject, '/name');
    } catch (e) {
      // If the name couldn't be found, simply do nothing
    }
    try {
      givenNameOld = vjp.get(oldObject, '/customAspects/person_generalInformation/attributes/person_generalInformation_givenName');
    } catch (e) {
      // If the above action fails, no further action is required
    }
    try {
      familyNameOld = vjp.get(oldObject, '/customAspects/person_generalInformation/attributes/person_generalInformation_familyName');
    } catch (e) {
      // If the above action fails, no further action is required
    }
    try {
      givenNameNew = vjp.get(newObject, '/customAspects/person_generalInformation/attributes/person_generalInformation_givenName');
    } catch (e) {
      // If the above action fails, no further action is required
    }
    try {
      familyNameNew = vjp.get(newObject, '/customAspects/person_generalInformation/attributes/person_generalInformation_familyName');
    } catch (e) {
      // If the above action fails, no further action is required
    }

    // Check whether the fullname has the same value as the computed fullname (wasn't overridden by the user)
    const computedFullNameOld = trim(`${givenNameOld} ${familyNameOld}`);
    const computedFullNameNew = trim(`${givenNameNew} ${familyNameNew}`);

    if (fullnameOld === computedFullNameOld || fullnameOld === '' || fullnameOld === undefined) {
      vjp.set(newObject, '/name', computedFullNameNew);
    }
    return newObject;
  }

  return {
    defaultReactiveFormActions,
    personReactiveFormActions
  };
}

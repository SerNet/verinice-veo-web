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
import { Vue } from 'vue/types/vue';
import { trim } from 'lodash';
import vjp from 'vue-json-pointer';

import { IBaseObject } from '~/lib/utils';
import { IVeoReactiveFormAction } from '~/types/VeoTypes';

export default {
  getDefaultReactiveFormActions,
  getPersonReactiveFormActions
};

export function getDefaultReactiveFormActions(context: Vue): IVeoReactiveFormAction[] {
  return [
    {
      attributeName: '/domains/patternProperties',
      handler: (newValue: any, newObject) => {
        newObject.domains[context.$user.lastDomain as string] = { ...newObject.domains[context.$user.lastDomain as string], ...newValue[Object.keys(newValue)[0]] };
        delete newObject.domains.patternProperties;
      }
    },
    {
      attributeName: `/domains/${context.$user.lastDomain}/subType`,
      handler: (newValue: any, newObject) => {
        if (!newValue && context.$user.lastDomain) {
          delete newObject.domains[context.$user.lastDomain].status;
        }
      }
    }
  ];
}

export function getPersonReactiveFormActions(_context: Vue): IVeoReactiveFormAction[] {
  return [
    {
      attributeName: '/customAspects/person_generalInformation/attributes/person_generalInformation_givenName',
      handler: (_newValue, newObject, oldObject) => {
        getFullName(newObject, oldObject);
      }
    },
    {
      attributeName: '/customAspects/person_generalInformation/attributes/person_generalInformation_familyName',
      handler: (_newValue, newObject, oldObject) => {
        getFullName(newObject, oldObject);
      }
    }
  ];
}

/*
 Helpers for previously defined reactive form actions

*/
export function getFullName(newObject: IBaseObject, oldObject: IBaseObject) {
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
}

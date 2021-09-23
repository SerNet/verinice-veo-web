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
import { cloneDeep, trim } from 'lodash';
import Vue from 'vue';
import vjp from 'vue-json-pointer';

import { IBaseObject } from '~/lib/utils';
import { IVeoReactiveFormAction } from '~/types/VeoTypes';

export default Vue.extend({
  data() {
    return {
      oldObjectData: undefined as IBaseObject | undefined // If an object gets modified, watch can't show the old version so we have to store it ourself. https://vuejs.org/v2/api/#vm-watch
    };
  },
  computed: {
    reactiveFormActions(): IVeoReactiveFormAction[] {
      return [
        {
          attributeName: '/customAspects/person_generalInformation/attributes/person_generalInformation_givenName',
          handler: (_newValue, newObject, oldObject) => {
            this.computeFullName(newObject, oldObject);
          }
        },
        {
          attributeName: '/customAspects/person_generalInformation/attributes/person_generalInformation_familyName',
          handler: (_newValue, newObject, oldObject) => {
            this.computeFullName(newObject, oldObject);
          }
        }
      ];
    }
  },
  watch: {
    'form.objectData': {
      handler(newObjectData: IBaseObject) {
        if (this.oldObjectData) {
          // Only proceed if this isn't triggered after initally loading the data
          for (const reactiveAction of this.reactiveFormActions) {
            let newValue;
            let oldValue;

            try {
              newValue = vjp.get(newObjectData, reactiveAction.attributeName);
              oldValue = vjp.get(this.oldObjectData, reactiveAction.attributeName);
            } catch (e) {
              // Default is already set to undefined, so we don't have to do anything here
            }

            if ((!!newValue || !!oldValue) && newValue !== oldValue) {
              reactiveAction.handler(newValue, newObjectData, this.oldObjectData);
            }
          }
        }
        this.oldObjectData = cloneDeep(newObjectData);
      },
      deep: true
    }
  },
  methods: {
    computeFullName(newObject: IBaseObject, oldObject: IBaseObject) {
      let fullnameOld = '';
      let givenNameOld = '';
      let familyNameOld = '';
      let givenNameNew = '';
      let familyNameNew = '';

      try {
        fullnameOld = vjp.get(oldObject, '/name');
      } catch (e) {
        // If the name couldn't be found, simpy do nothing
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
  }
});

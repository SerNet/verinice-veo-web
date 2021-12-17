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
import { useContext } from '@nuxtjs/composition-api';
import { cloneDeep, isString } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { IVeoEntity } from '~/types/VeoTypes';

export function useVeoObjectUtilities() {
  const { t } = useI18n();
  const { $api } = useContext();

  /**
   * Duplicates an object, including adding its children to the new object.
   * Does NOT add the new object to all parents of the original object.
   *
   * @param object The object to clone
   * @returns Returns a promise that resolves if the object was cloned successfully and rejects if the object couldn't be cloned
   */
  async function cloneObject(object: IVeoEntity) {
    const newEntity = cloneDeep(object);
    newEntity.name = `${object.name} (${t('clone').toString()})`;

    // Remove readonly properties that shouldn't be posted
    // @ts-ignore
    delete newEntity.id;
    // @ts-ignore
    delete newEntity.displayName;
    // @ts-ignore
    delete newEntity.designator;

    return await $api.entity.create(newEntity.type, newEntity);
  }

  /**
   * Removes an object as the member of another object.
   *
   * @param object The object to remove the child from
   * @param objectToRemove The child to remove
   * @param parentType If object is a string, the type of the object to remove the child from has to be specified
   * @returns Returns a promise that resolves if the child was removed successfully and rejects if the child couldn't be removed
   */
  async function unlinkObject(object: IVeoEntity | string, objectToRemove: IVeoEntity | string, parentType?: string) {
    if (isString(object) && !parentType) {
      throw new Error('VeoObjectUtilities::unlinkObject: "parentType" has to be specified if object is a uuid');
    }
    const _object = isString(object) ? await $api.entity.fetch(parentType as string, object) : object;
    const objcectToRemoveUUID = isString(objectToRemove) ? objectToRemove : objectToRemove.id;

    if (_object.type === 'scope') {
      _object.members = _object.members.filter((member) => !member.targetUri.includes(objcectToRemoveUUID));
    } else {
      _object.parts = _object.parts.filter((part) => !part.targetUri.includes(objcectToRemoveUUID));
    }
    return await $api.entity.update(_object.type, _object.id, _object);
  }

  return {
    cloneObject,
    unlinkObject
  };
}

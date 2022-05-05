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
import { cloneDeep, isArray, isString } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { getSchemaEndpoint } from '~/plugins/api/schema';
import { IVeoEntity } from '~/types/VeoTypes';

export interface IVeoAPIObjectIdentifier {
  objectId: string;
  objectType: string;
}

export function useVeoObjectUtilities() {
  const { t } = useI18n();
  const { $api, $config } = useContext();

  /**
   * Duplicates an object, including adding its children to the new object.
   * Does NOT add the new object to all parents of the original object.
   *
   * @param object The object to clone
   * @returns Returns a promise that resolves if the object was cloned successfully and rejects if the object couldn't be cloned
   */
  const cloneObject = async (object: IVeoEntity) => {
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
  };

  /**
   * Removes an object as the member of another object.
   *
   * @param object The object to remove the child from
   * @param objectToRemove The child to remove
   * @param parentType If object is a string, the type of the object to remove the child from has to be specified
   * @returns Returns a promise that resolves if the child was removed successfully and rejects if the child couldn't be removed
   */
  const unlinkObject = async (object: IVeoEntity | string, objectToRemove: IVeoEntity | string, parentType?: string) => {
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
  };

  /**
   * Link an object to another object, either as its parent or its child
   *
   * @param hierarchicalContext Specifies whether to link the new object as a parent or a child
   * @param objectToModify If you want to link a child, put here the object parent, if you want to link as a child, if you want to link as a parent, put here the child
   * @param objectToAdd If you want to link a child put here the object to link as child, if you want to link as a parent, put here the object that should be the parent
   * @param batchReplace If set to true and an array is passed to objectToAdd, the previous children of objectToModify get overwritten by the new object, else they get appended. Only applies for hierarchicalContext=child
   */
  const linkObject = async (
    hierarchicalContext: 'child' | 'parent',
    objectToModify: IVeoAPIObjectIdentifier,
    objectToAdd: IVeoAPIObjectIdentifier | IVeoAPIObjectIdentifier[],
    batchReplace: boolean = true
  ) => {
    const schemas = await $api.schema.fetchAll();
    if (hierarchicalContext === 'parent' && isArray(objectToAdd)) {
      // eslint-disable-next-line no-console
      console.warn('VeoObjectUtilities::linkObject: Batch entity updates are only supported for child links. Exiting');
      return;
    }

    if (hierarchicalContext === 'parent') {
      objectToAdd = objectToAdd as IVeoAPIObjectIdentifier;
      const editedEntity = await $api.entity.fetch(objectToAdd.objectType, objectToAdd.objectId);
      const childrenProperty = editedEntity.type === 'scope' ? 'members' : 'parts';

      const newLink = {
        targetUri: `${$config.apiUrl}/${getSchemaEndpoint(schemas, objectToModify.objectType) || objectToModify.objectType}/${objectToModify.objectId}`
      };

      editedEntity[childrenProperty].push(newLink);

      await $api.entity.update(editedEntity.type, editedEntity.id, editedEntity);
    } else {
      const editedEntity = await $api.entity.fetch(objectToModify.objectType, objectToModify.objectId);
      const childrenProperty = editedEntity.type === 'scope' ? 'members' : 'parts';

      const newLinkEntries = (isArray(objectToAdd) ? objectToAdd : [objectToAdd]).map((object) => ({
        targetUri: `${$config.apiUrl}/${getSchemaEndpoint(schemas, object.objectType) || object.objectType}/${object.objectId}`
      }));

      if (batchReplace && isArray(objectToAdd)) {
        editedEntity[childrenProperty] = [];
      }
      editedEntity[childrenProperty].push(...newLinkEntries);
      await $api.entity.update(editedEntity.type, editedEntity.id, editedEntity);
    }
  };

  return {
    cloneObject,
    linkObject,
    unlinkObject
  };
}

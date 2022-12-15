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

import { useFetchSchemas } from './api/schemas';
import { useCreateObject, useUpdateObject } from './api/objects';
import { IVeoEntity } from '~/types/VeoTypes';

export interface IVeoAPIObjectIdentifier {
  id: string;
  type: string;
}

export const useCreateLink = () => {
  const { $config } = useContext();

  const createLink = (endpoint: string, objectId: string) => ({
    targetUri: `${$config.apiUrl}/${endpoint}/${objectId}`
  });

  return { createLink };
};

export const useCloneObject = () => {
  const { t } = useI18n();
  const { data: endpoints } = useFetchSchemas();
  const { mutateAsync: createObject } = useCreateObject();

  const clone = (object: IVeoEntity, parentScopes?: string[]) => {
    const newObject = cloneDeep(object);

    // Modify new object
    newObject.name = `${object.name} (${t('clone').toString()})`;
    // @ts-ignore
    delete newObject.id;
    // @ts-ignore
    delete newObject.displayName;
    // @ts-ignore
    delete newObject.designator;

    return createObject({ endpoint: endpoints.value?.[newObject.type], object: newObject, parentScopes });
  };

  return { clone };
};

export const useUnlinkObject = () => {
  const { data: endpoints } = useFetchSchemas();

  const { mutateAsync: updateObject } = useUpdateObject();

  const unlink = (objectToModify: IVeoEntity, objectToRemove: IVeoEntity | string) => {
    const object = cloneDeep(objectToModify);

    const objcectToRemoveUUID = isString(objectToRemove) ? objectToRemove : objectToRemove.id;

    if (object.type === 'scope') {
      object.members = object.members.filter((member) => !member.targetUri.includes(objcectToRemoveUUID));
    } else {
      object.parts = object.parts.filter((part) => !part.targetUri.includes(objcectToRemoveUUID));
    }
    return updateObject({ endpoint: endpoints.value?.[object.type], object });
  };

  return { unlink };
};

export const useLinkObject = () => {
  const { createLink } = useCreateLink();
  const { data: endpoints } = useFetchSchemas();

  const { mutateAsync: updateObject } = useUpdateObject();

  const link = (
    objectToModify: IVeoEntity,
    objectsToAdd: (IVeoEntity | IVeoAPIObjectIdentifier)[] | (IVeoEntity | IVeoAPIObjectIdentifier),
    replaceExistingLinks: boolean = false
  ) => {
    const object = cloneDeep(objectToModify);
    const _objectsToAdd = !Array.isArray(objectsToAdd) ? [objectsToAdd] : objectsToAdd;

    const property = objectToModify.type === 'scope' ? 'members' : 'parts';

    if (replaceExistingLinks) {
      object[property] = [];
    }
    _objectsToAdd.forEach((_objectToAdd) => {
      object[property].push(createLink(endpoints.value?.[_objectToAdd.type] as string, _objectToAdd.id));
    });

    return updateObject({ endpoint: endpoints.value?.[object.type], object });
  };

  return { link };
};

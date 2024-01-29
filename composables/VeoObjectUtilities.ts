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
import { cloneDeep, isString } from 'lodash';

import schemaQueryDefinitions from '~/composables/api/queryDefinitions/schemas';
import objectQueryDefinitions from '~/composables/api/queryDefinitions/objects';

import { IVeoEntity } from '~/types/VeoTypes';
import { useQuery } from './api/utils/query';
import { useMutation } from './api/utils/mutation';

const route = useRoute();

export interface IVeoAPIObjectIdentifier {
  id: string;
  type: string;
}

export const useCreateLink = () => {
  const config = useRuntimeConfig();

  const createLink = (endpoint: string, objectId: string) => ({
    targetUri: `${config.public.apiUrl}/${endpoint}/${objectId}`,
  });

  return { createLink };
};

export const useCloneObject = () => {
  const { t } = useI18n();
  const { data: endpoints } = useQuery(
    schemaQueryDefinitions.queries.fetchSchemas
  );
  const { mutateAsync: createObject } = useMutation(
    objectQueryDefinitions.mutations.createObject
  );

  const clone = (object: IVeoEntity, parentScopes?: string[]) => {
    const newObject = cloneDeep(object);

    // Modify new object
    newObject.name = `${object.name} (${t('clone').toString()})`;
    // @ts-ignore Remove the id, as a new object doesn't have an id yet.
    delete newObject.id;
    // @ts-ignore Remove the display name, as the backend and DTO don't contain the display name as we generate it in the frontend
    delete newObject.displayName;
    // @ts-ignore Remove the designator, as a new object doesn't have a designator yet.
    delete newObject.designator;

    return createObject({
      domain: route.params.domain,
      endpoint: endpoints.value?.[newObject.type],
      object: newObject,
      parentScopes,
    });
  };

  return { clone };
};

export const useUnlinkObject = () => {
  const { data: endpoints } = useQuery(
    schemaQueryDefinitions.queries.fetchSchemas
  );

  const { mutateAsync: updateObject } = useMutation(
    objectQueryDefinitions.mutations.updateObject
  );

  const unlink = (
    objectToModify: IVeoEntity,
    objectToRemove: IVeoEntity | string
  ) => {
    const object = cloneDeep(objectToModify);

    const objcectToRemoveUUID =
      isString(objectToRemove) ? objectToRemove : objectToRemove.id;

    if (object.type === 'scope') {
      object.members = object.members.filter(
        (member) => !member.targetUri.includes(objcectToRemoveUUID)
      );
    } else {
      object.parts = object.parts.filter(
        (part) => !part.targetUri.includes(objcectToRemoveUUID)
      );
    }
    return updateObject({
      domain: route.params.domain,
      endpoint: endpoints.value?.[object.type],
      object,
    });
  };

  return { unlink };
};

export const useLinkObject = () => {
  const { createLink } = useCreateLink();
  const { data: endpoints } = useQuery(
    schemaQueryDefinitions.queries.fetchSchemas
  );

  const { mutateAsync: updateObject } = useMutation(
    objectQueryDefinitions.mutations.updateObject
  );

  const link = (
    objectToModify: IVeoEntity,
    objectsToAdd:
      | (IVeoEntity | IVeoAPIObjectIdentifier)[]
      | (IVeoEntity | IVeoAPIObjectIdentifier),
    replaceExistingLinks = false
  ) => {
    const object = cloneDeep(objectToModify);
    const _objectsToAdd =
      !Array.isArray(objectsToAdd) ? [objectsToAdd] : objectsToAdd;

    const property = objectToModify.type === 'scope' ? 'members' : 'parts';

    if (replaceExistingLinks) {
      object[property] = [];
    }
    _objectsToAdd.forEach((_objectToAdd) => {
      object[property].push(
        createLink(
          endpoints.value?.[_objectToAdd.type] as string,
          _objectToAdd.id
        )
      );
    });

    return updateObject({
      domain: route.params.domain,
      endpoint: endpoints.value?.[object.type],
      object,
    });
  };

  return { link };
};

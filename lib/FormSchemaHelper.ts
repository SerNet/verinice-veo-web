/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann, Davit Svandize
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
import FormSchemaValidator from './FormSchemaValidator';
import { VeoSchemaValidatorValidationResult } from './ObjectSchemaValidator';
import { IVeoFormSchemaTranslationCollection, IVeoObjectSchema } from '~/types/VeoTypes';
import { IVeoFormSchema, IVeoFormSchemaItem, IVeoFormSchemaMeta } from '~~/composables/api/queryDefinitions/forms';
import { cloneDeep } from 'lodash';

export function generateSchema(
  name: IVeoFormSchemaMeta['name'],
  modelType: string,
  subType: string,
  sorting: string | null,
  translation: IVeoFormSchemaTranslationCollection = {}
): IVeoFormSchema {
  return {
    name,
    modelType,
    subType,
    translation,
    content: {
      type: 'Layout',
      options: {
        format: 'group',
        direction: 'vertical'
      },
      elements: []
    },
    sorting
  };
}

export function validate(schema: IVeoFormSchema, objectSchema: undefined | IVeoObjectSchema): VeoSchemaValidatorValidationResult {
  const validator = new FormSchemaValidator();
  return validator.validate(schema, objectSchema);
}

/**
 * This function deletes the translations of a form schema element from the form schema translations object.
 * 
 * @param formschema The form schema to modify
 * @param elementFormSchema The element to delete the translations for
 * @returns The form schema without the translations for the specified element
 */
export const deleteFormSchemaElementTranslations = (formschema: IVeoFormSchema, elementFormSchema: IVeoFormSchemaItem) => {
  const _formSchema = cloneDeep(formschema);
  let possibleTranslationKey: string | undefined;
  if(elementFormSchema.type === 'Label') {
    possibleTranslationKey = elementFormSchema.text;
  } else {
    possibleTranslationKey = elementFormSchema.options.label;
  }

  if(!possibleTranslationKey) {
    return _formSchema;
  }

  Object.entries(_formSchema.translation).forEach(([locale, _]) => {
    if(!possibleTranslationKey) {
      return;
    }
    delete _formSchema.translation[locale][possibleTranslationKey];
  });
  return _formSchema;
};

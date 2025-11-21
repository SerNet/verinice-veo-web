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
import type { VeoSchemaValidatorValidationResult } from './ObjectSchemaValidator';
import type { IVeoDomainSpecificObjectSchema, IVeoFormSchemaTranslationCollection } from '~/types/VeoTypes';
import type { IVeoFormSchema, IVeoFormSchemaItem } from '~/composables/api/queryDefinitions/forms';
import { cloneDeep } from 'lodash';

export function generateSchema(
  name: string,
  context: string,
  modelType: string,
  subType: string,
  sorting: string | null,
  defaultLocale: string,
  translation: IVeoFormSchemaTranslationCollection = {}
): IVeoFormSchema {
  return {
    name: { [defaultLocale]: name },
    context,
    modelType,
    subType,
    translation: translation ?? { [defaultLocale]: {} },
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

export function validate(
  schema: IVeoFormSchema,
  objectSchema: undefined | IVeoDomainSpecificObjectSchema
): VeoSchemaValidatorValidationResult {
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
export const deleteFormSchemaElementTranslations = (
  formschema: IVeoFormSchema,
  elementFormSchema: IVeoFormSchemaItem
) => {
  const _formSchema = cloneDeep(formschema);
  let possibleTranslationKey: string | undefined;
  if (elementFormSchema.type === 'Label') {
    possibleTranslationKey = elementFormSchema.text;
  } else {
    possibleTranslationKey = elementFormSchema.options.label;
  }

  if (!possibleTranslationKey) {
    return _formSchema;
  }

  Object.entries(_formSchema.translation).forEach(([locale, _]) => {
    if (!possibleTranslationKey) {
      return;
    }
    Reflect.deleteProperty(_formSchema.translation[locale], possibleTranslationKey);
  });
  return _formSchema;
};

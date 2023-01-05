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
import { IVeoFormSchema, IVeoFormSchemaItem, IVeoFormSchemaTranslationCollection, IVeoFormSchemaItemRule, IVeoObjectSchema, IVeoFormSchemaMeta } from '~/types/VeoTypes';

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
 * FormSchemaEditorHelpers
 */

export function deleteElementCustomTranslation(
  elementFormSchema: IVeoFormSchemaItem,
  customTranslations: IVeoFormSchemaTranslationCollection,
  callbackUpdateCustomTranslation: (updatedCustomTranslationValue: IVeoFormSchemaTranslationCollection) => void
): void {
  // Remove the element and also all translation key from customTranslations
  let translationKeysToRemove = JSON.stringify(elementFormSchema).match(/#lang\/[\w-]+/g);
  if (translationKeysToRemove) {
    const localCustomTranslation: IVeoFormSchemaTranslationCollection = JSON.parse(JSON.stringify(customTranslations));

    // @ts-ignore Some type error, but as the editors will get reworked anyways ¯\_(ツ)_/¯
    translationKeysToRemove = translationKeysToRemove.map((key) => key.replace('#lang/', ''));
    translationKeysToRemove.forEach((key) => {
      for (const lang in customTranslations) {
        delete localCustomTranslation[lang][key];
      }
    });
    callbackUpdateCustomTranslation(localCustomTranslation);
  }
}

export const ruleEffectIcons = {
  SHOW: 'mdi-eye-outline',
  HIDE: 'mdi-eye-off-outline'
};

export function getRuleEffectIcons(ruleEffect: IVeoFormSchemaItemRule['effect']) {
  return ruleEffect ? ruleEffectIcons[ruleEffect] : undefined;
}

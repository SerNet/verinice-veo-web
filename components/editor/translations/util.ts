/*
 * verinice.veo web
 * Copyright (C) 2023  Jonas Heitmann
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
import type { IVeoFormsTranslations } from '~/components/dynamic-form/types';
import type { IEditorTranslations} from './types';
import { TRANSLATION_SOURCE } from './types';
import { cloneDeep } from 'lodash';

/**
 * In the editor, translations are used in a different format than in the forms. This function converts the editor translations to the forms translations.
 *
 * @param translations Incoming editor translations
 * @param sources The sources to include. If UNSPECIFIED is included, all sources are included. If not, only the specified sources are included.
 * @returns The converted translations
 */
export const editorTranslationsToFormsTranslations = (
  translations: IEditorTranslations,
  sources: TRANSLATION_SOURCE[] = [TRANSLATION_SOURCE.UNSPECIFIED]
): IVeoFormsTranslations =>
  Object.entries(translations).reduce((_translations, [key, value]) => {
    Object.entries(value).forEach(([source, translations]) => {
      Object.entries(translations).forEach(([locale, translation]) => {
        const _source = parseInt(source, 10) as TRANSLATION_SOURCE;

        // If sources contains UNSPECIFIED, all sources are allowed. Else only the specified sources are allowed, other translations get ignored.
        if (!sources.includes(TRANSLATION_SOURCE.UNSPECIFIED) && !sources.includes(_source)) {
          return;
        }

        // If this key already exists for this language, this means the translation has been set by the formschema and as it is more specific, it should be used
        if (_source === TRANSLATION_SOURCE.OBJECTSCHEMA && _translations?.[locale]?.[key]) {
          return;
        }
        if (!_translations[locale]) {
          _translations[locale] = Object.create(null);
        }
        _translations[locale][key] = translation;
      });
    });
    return _translations;
  }, Object.create(null));

/**
 * In the editor, translations are used in a different format than in the forms. This function converts the forms translations to the editor translations.
 *
 * @param translations Incoming forms translations
 * @param source The source to use for the editor translations. Only one can be specified as the forms translations are missing the required meta data
 * @param existingEditorTranslation Existing editor translations to merge with the new translations
 * @param replace If true, existing translations will be replaced. If false, existing translations will be kept.
 * @returns The converted translations
 */
export const formsTranslationsToEditorTranslations = (
  translations: IVeoFormsTranslations,
  source: TRANSLATION_SOURCE,
  existingEditorTranslation: IEditorTranslations = {},
  replace = true
): IEditorTranslations => {
  const toReturn = cloneDeep(existingEditorTranslation);
  Object.entries(translations).forEach(([locale, localeTranslations]) => {
    Object.entries(localeTranslations).forEach(([key, value]) => {
      if (!toReturn[key]) {
        toReturn[key] = Object.create(null);
      }
      if (!toReturn[key][source]) {
        toReturn[key][source] = Object.create(null);
      }
      if (toReturn[key][source][locale] && !replace) {
        return;
      }
      toReturn[key][source][locale] = value;
    });
  });
  return toReturn;
};

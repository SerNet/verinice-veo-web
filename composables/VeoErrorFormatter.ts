/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
import { ErrorObject } from 'ajv';
import { useI18n } from 'nuxt-i18n-composable';

import { IBaseObject } from '~/lib/utils';

export const useVeoErrorFormatter = () => {
  const { t } = useI18n();

  const formatErrors = (errors: ErrorObject[], translations: IBaseObject) => {
    const formattedErrors = new Map<string, string[]>();

    for (const error of errors) {
      const [objectSchemaPointer, errorMessage] = formatError(error, translations);

      const previousValue = formattedErrors.get(objectSchemaPointer) || [];
      previousValue.push(errorMessage);
      formattedErrors.set(objectSchemaPointer, previousValue);
    }

    return formattedErrors;
  };

  const formatError = (error: ErrorObject, translations: IBaseObject) => {
    const keyMatch = error.schemaPath.match(/((.+\/properties\/\w+\b)|(.+(?=\/required)))/g);
    if (!keyMatch) {
      throw new Error('Key does not match in Errors array');
    }

    const indexMatch = error.instancePath.match(/\/\d+$/);
    const missingProperty = (error.params as any).missingProperty;
    const requiredKey = `${keyMatch[0]}${indexMatch ? indexMatch[0] : ''}/properties/${missingProperty}`;

    const key = error.keyword !== 'required' ? keyMatch[0] : requiredKey;
    let translatedErrorString = '';

    switch (error.keyword) {
      case 'required':
        // Special handling of links, as their last data path entry isn't the string we search for
        if (['targetUri', 'target'].includes(missingProperty)) {
          translatedErrorString = handleRequiredLink(error, translations);
          break;
        }
        translatedErrorString = t(`error.${error.keyword}`, { field: getInvalidFieldLabel(missingProperty, translations) }).toString();
        break;
      // While pattern and format are separate errors, we want to display the same error message for both, as both have to be fixed the same way by the user
      case 'format':
      case 'pattern':
        translatedErrorString = t('error.format', {
          field: getInvalidFieldLabel(error.instancePath.split('/').pop() || error.instancePath, translations),
          format: (error.params as any)[error.keyword]
        }).toString();
        break;
      default:
        translatedErrorString = error.message || '';
    }

    return [key, translatedErrorString];
  };

  const handleRequiredLink = (error: ErrorObject, translations: IBaseObject): string => {
    const dataPathParts = error.instancePath.split('/');
    const missingProperty = (error.params as any).missingProperty;
    let index: number | undefined;
    if (missingProperty === 'targetUri') {
      dataPathParts.pop();
      index = Number(dataPathParts.pop());
    } else if (missingProperty === 'target') {
      index = Number(dataPathParts.pop());
    }

    const position = index ? `${index + 1}.` : '';
    return t(`error.${error.keyword}_link`, {
      field: getInvalidFieldLabel(dataPathParts.pop() || missingProperty, translations),
      position
    }).toString();
  };

  const getInvalidFieldLabel = (field: string, translations: IBaseObject): string => {
    return translations[field] || field;
  };

  return {
    formatErrors
  };
};

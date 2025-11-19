/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann, jae
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
import type { ErrorObject } from 'ajv';
import { last } from 'lodash';

export const useVeoErrorFormatter = () => {
  const { t } = useI18n();

  const formatErrors = (errors: ErrorObject[], translations: Record<string, any>) => {
    const formattedErrors = new Map<string, string[]>();

    for (const error of errors) {
      const [objectSchemaPointer, errorMessage] = formatError(error, translations);

      const previousValue = formattedErrors.get(objectSchemaPointer) || [];
      previousValue.push(errorMessage);
      formattedErrors.set(objectSchemaPointer, previousValue);
    }

    return formattedErrors;
  };

  const formatError = (error: ErrorObject, translations: Record<string, any>) => {
    const isRequiredRule = error.schemaPath.match(/((.+\/properties\/(\w-)+\b)|(.+(?=\/required)))/g);
    const isEqualRule = !!error.params.allowedValues;
    const isAdditionalPropertiesRule = error.keyword === 'additionalProperties';
    const isPatternRule = error.keyword === 'pattern';
    const isFormatRule = error.keyword === 'format';
    const isTypeRule = error.keyword === 'type';

    if (
      ![!!isRequiredRule, isEqualRule, isAdditionalPropertiesRule, isPatternRule, isFormatRule, isTypeRule].some(
        (rule) => rule
      )
    ) {
      throw new Error(`No error formatter found for ${JSON.stringify(error)}`);
    }

    let indexMatch;
    let objectSchemaPointer = '';
    let affectedProperty;
    if (isRequiredRule) {
      indexMatch = error.instancePath.match(/(\/\d+$)|(\/\d+\/)/);
      objectSchemaPointer = indexMatch ? isRequiredRule[0].replace('/items/', indexMatch[0]) : isRequiredRule[0];
    }
    if (isEqualRule || isAdditionalPropertiesRule) {
      const paths = error.schemaPath.split('/');
      paths.pop();
      affectedProperty = last(paths);
      objectSchemaPointer = paths.join('/');
    }
    if (isPatternRule || isFormatRule || isTypeRule) {
      objectSchemaPointer = error.schemaPath.replace(/\/pattern$/, '');
    }
    if (isTypeRule) {
      objectSchemaPointer = error.schemaPath.replace(/\/type/, '');

      // Check for link elements
      const pointerIndexMatch = error.instancePath.match(/(\/\d+$)|(\/\d+\/)/);
      if (pointerIndexMatch) {
        objectSchemaPointer = objectSchemaPointer.replace('/items/', pointerIndexMatch[0]);
      }
    }

    let translatedErrorString = '';

    switch (error.keyword) {
      case 'required':
        affectedProperty = (error.params as Record<string, any>).missingProperty;
        objectSchemaPointer = `${(isRequiredRule as RegExpMatchArray)[0]}${
          indexMatch ? indexMatch[0] : ''
        }/properties/${affectedProperty}`;
        // Special handling of links, as their last data path entry isn't the string we search for
        if (['targetUri', 'target'].includes(affectedProperty)) {
          translatedErrorString = handleRequiredLink(error, translations);
          break;
        }
        translatedErrorString = t(`error.${error.keyword}`, {
          field: getInvalidFieldLabel(affectedProperty, translations)
        }).toString();
        break;
      // While pattern, type and format are separate errors, we want to display the same error message, because all of them have to be fixed the same way by the user
      case 'format':
      case 'type':
      case 'pattern':
        translatedErrorString = t('error.format', {
          field: getInvalidFieldLabel(error.instancePath.split('/').pop() || error.instancePath, translations),
          format: error.params[error.keyword]
        }).toString();
        break;
      // Enum is the keyword if a field is expected to have a certain value (one of the ones present in the enum) but has another one
      case 'enum':
      case 'additionalProperties':
        translatedErrorString = t(`error.${error.keyword}`, {
          field: getInvalidFieldLabel(affectedProperty as string, translations)
        }).toString();
        break;
      default:
        translatedErrorString = error.message || '';
    }

    return [objectSchemaPointer, translatedErrorString];
  };

  const handleRequiredLink = (error: ErrorObject, translations: Record<string, any>): string => {
    const dataPathParts = error.instancePath.split('/');
    const missingProperty = error.params.missingProperty;
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

  const getInvalidFieldLabel = (field: string, translations: Record<string, any>): string => {
    return translations[field] || field;
  };

  return {
    formatErrors
  };
};

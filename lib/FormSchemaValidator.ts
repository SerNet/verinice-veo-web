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
import { JsonPointer } from 'json-ptr';

import {
  VeoSchemaValidatorMessage,
  VeoSchemaValidatorValidationResult
} from './ObjectSchemaValidator';
import { IVeoObjectSchema } from '~/types/VeoTypes';
import { IVeoFormSchema } from '~/composables/api/queryDefinitions/forms';

export type VeoSchemaValidatorRequiredProperty =
  | string
  | { key: string; value: any };

export default class FormSchemaValidator {
  private errors: VeoSchemaValidatorMessage[] = [];
  private warnings: VeoSchemaValidatorMessage[] = [];

  /**
   *
   * @param schema The form schema to validate
   * @param objectSchema The object schema to validate against (if not set, there won't be a test whether the propreties exist in the object schema)
   * @param context The context, used for error messages.
   *
   * @returns VeoSchemaValidatorValidationResult Contains all errors and warnings generated while checking the schema.
   */
  public validate(
    schema: IVeoFormSchema | IVeoFormSchema['content'],
    objectSchema: IVeoObjectSchema | undefined = undefined
  ): VeoSchemaValidatorValidationResult {
    this.errors = [];
    this.warnings = [];
    if (objectSchema) {
      this.propertiesExistInObjectSchema(schema, objectSchema);
    } else {
      this.warnings.push({
        code: 'W_OBJECTSCHEMA_MISSING',
        message:
          'No object schema provided. Provide one for more in depth validation.'
      });
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  private propertiesExistInObjectSchema(
    formSchema: any,
    objectSchema: IVeoObjectSchema
  ) {
    if (formSchema.content) {
      this.elementExists(formSchema.content, objectSchema, `#/`, undefined);
    } else if (formSchema.elements) {
      this.elementExists(formSchema, objectSchema, `#/`, undefined);
    } else {
      this.warnings.push({
        code: 'W_CONTENT_MISSING',
        message: 'This formschema has no controls and thus no use.'
      });
    }
  }

  private elementExists(
    element: any,
    objectSchema: IVeoObjectSchema,
    context: string,
    parent: any
  ) {
    if (!element.scope && element.type === 'Control') {
      this.errors.push({
        code: 'E_SCOPE_MISSING',
        message: `The element ${context} is missing its scope.`
      });
    } else if (element.scope) {
      let scope = element.scope;
      let schema = JsonPointer.get(objectSchema, scope) as any;

      /* Link attributes don't have an absolute pointer, but one relative to their parent (to avoid 
       them getting used outside the link), so we have to add the pointer of the parent in front.
      */
      if (!schema && parent?.scope) {
        scope = `${parent.scope}/items${element.scope.slice(1)}`;
        schema = JsonPointer.get(objectSchema, scope) as any;
      }

      if (!schema) {
        this.errors.push({
          code: 'E_PROPERTY_MISSING',
          message: `The element ${scope} doesn't exist in the object schema.`,
          actions: [
            {
              key: 'fix',
              title: (t) => t('fix'),
              callback: (item: any, emit: any) =>
                emit('fix', item.code, item.params)
            }
          ],
          params: { formSchemaPointer: context.substr(0, context.length - 1) } // We have to remove the trailing slash in order for JsonPointer to pick the currect path
        });
      }
    }

    if (element.elements) {
      for (const child in element.elements) {
        this.elementExists(
          element.elements[child],
          objectSchema,
          `${context}elements/${child}/`,
          element
        );
      }
    }
  }
}

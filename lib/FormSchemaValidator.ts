import Ajv from 'ajv';
import { JsonPointer } from 'json-ptr';

import { VeoSchemaValidatorMessage, VeoSchemaValidatorValidationResult } from './ObjectSchemaValidator';
import { IVeoObjectSchema } from '~/types/VeoTypes';

export type VeoSchemaValidatorRequiredProperty = string | { key: string; value: any };

export default class FormSchemaValidator {
  private errors: VeoSchemaValidatorMessage[] = [];
  private warnings: VeoSchemaValidatorMessage[] = [];

  private ajv: Ajv.Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      jsonPointers: true,
      strictKeywords: true
    });
  }

  /**
   *
   * @param schema The form schema to validate
   * @param objectSchema The object schema to validate against (if not set, there won't be a test whether the propreties exist in the object schema)
   * @param context The context, used for error messages.
   *
   * @returns VeoSchemaValidatorValidationResult Contains all errors and warnings generated while checking the schema.
   */
  public validate(schema: any, objectSchema: IVeoObjectSchema | undefined = undefined): VeoSchemaValidatorValidationResult {
    if (objectSchema) {
      this.propertiesExistInObjectSchema(schema, objectSchema);
    } else {
      this.warnings.push({ code: 'W_OBJECTSCHEMA_MISSING', message: 'No object schema provided. Provide one for more in depth validation.' });
    }

    return { valid: this.errors.length === 0, errors: this.errors, warnings: this.warnings };
  }

  private propertiesExistInObjectSchema(formSchema: any, objectSchema: IVeoObjectSchema) {
    if (formSchema.content) {
      this.elementExists(formSchema.content, objectSchema, `#/`, undefined);
    } else {
      this.warnings.push({ code: 'W_CONTENT_MISSING', message: 'This formschema has no controls and thus no use.' });
    }
  }

  private elementExists(element: any, objectSchema: IVeoObjectSchema, context: string, parent: any) {
    if (!element.scope && element.type === 'Control') {
      this.errors.push({ code: 'E_SCOPE_MISSING', message: `The element ${context} is missing its scope.` });
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
          fixable: true,
          params: { formSchemaPointer: context.substr(0, context.length - 1) } // We have to remove the trailing slash in order for JsonPointer to pick the currect path
        });
      }
    }

    if (element.elements) {
      for (const child in element.elements) {
        this.elementExists(element.elements[child], objectSchema, `${context}elements/${child}/`, element);
      }
    }
  }
}

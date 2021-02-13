import Ajv from 'ajv'
import { JsonPointer } from 'json-ptr'

import { IVeoObjectSchema } from '~/types/VeoTypes'
import { VeoSchemaValidatorMessage, VeoSchemaValidatorValidationResult } from './ObjectSchemaValidator'

export type VeoSchemaValidatorRequiredProperty = string | { key: string, value: any }

export default class FormSchemaValidator {

  private errors: VeoSchemaValidatorMessage[] = []
  private warnings: VeoSchemaValidatorMessage[] = []

  private ajv: Ajv.Ajv

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      jsonPointers: true,
      strictKeywords: true
    })
  }

  /**
   * 
   * @param schema The form schema to validate
   * @param objectSchema The object schema to validate against (if not set, there won't be a test whether the propreties exist in the object schema)
   * @param context The context, used for error messages.
   * 
   * @returns VeoSchemaValidatorValidationResult Contains all errors and warnings generated while checking the schema.
   */
  public validate(schema: any, objectSchema: IVeoObjectSchema | undefined = undefined, context: string = 'schema'): VeoSchemaValidatorValidationResult {

    if(objectSchema) {
      this.propertiesExistInObjectSchema(schema, objectSchema, context)
    } else {
      this.warnings.push({ code: 'W_OBJECTSCHEMA_MISSING', message: 'No object schema provided. Provide one for more in depth validation.' })
    }

    return { valid: this.errors.length === 0, errors: this.errors, warnings: this.warnings }
  }


  private propertiesExistInObjectSchema(formSchema: any, objectSchema: IVeoObjectSchema, context: string) {
    if(formSchema.content) {
      this.elementExists(formSchema.content, objectSchema, `${context}.content`)
    } else {
      this.warnings.push({ code: 'W_CONTENT_MISSING', message: 'This formschema has no controls and thus no use.' })
    }
    
  }

  private elementExists(element: any, objectSchema: IVeoObjectSchema, context: string) {
    if(!element.scope && element.type === 'Control') {
      this.errors.push({ code: 'E_SCOPE_MISSING', message: `The element ${context} is missing its scope.` })
    } else if (element.scope) {
      if(!JsonPointer.get(objectSchema, element.scope)) {
        this.errors.push({ code: 'E_PROPERTY_MISSING', message: `The element ${element.scope} doesn't exist in the object schema.` })
      }
    }    

    if(element.elements) {
      for(const child in element.elements) {
        this.elementExists(element.elements[child], objectSchema, `${context}.elements.[${child}]`)
      }
    }
  } 
}

<!--
   - verinice.veo web
   - Copyright (C) 2021 Davit Svandize, Jonas Heitmann, Jessica Lühnen, Samuel Vitzthum, Markus Werner
   - 
   - This program is free software: you can redistribute it and/or modify
   - it under the terms of the GNU Affero General Public License as published by
   - the Free Software Foundation, either version 3 of the License, or
   - (at your option) any later version.
   -
   - This program is distributed in the hope that it will be useful,
   - but WITHOUT ANY WARRANTY; without even the implied warranty of
   - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   - GNU Affero General Public License for more details.
   -
   - You should have received a copy of the GNU Affero General Public License
   - along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
<script lang="ts">
import Vue, { VNode, PropOptions, CreateElement } from 'vue';
import { JSONSchema7 } from 'json-schema';
import { JsonPointer } from 'json-ptr';

import vjp from 'vue-json-pointer';
import { ErrorObject, ValidateFunction } from 'ajv';
import { cloneDeep, merge } from 'lodash';
import { Layout as ILayout, Control as IControl, Label as ILabel, UISchema, UISchemaElement } from '~/types/UISchema';
import { BaseObject, ajv, propertyPath, generateFormSchema, Mode, evaluateRule, IRule } from '~/components/forms/utils';
import Label from '~/components/forms/Label.vue';
import Control from '~/components/forms/Control.vue';
import Layout from '~/components/forms/Layout.vue';
import Wrapper from '~/components/forms/Wrapper.vue';
import { IVeoReactiveFormAction, IVeoTranslationCollection } from '~/types/VeoTypes';
import { IBaseObject } from '~/lib/utils';
import { getDefaultReactiveFormActions } from '~/components/forms/reactiveFormActions';

interface IErrorMessageElement {
  pointer: string;
  message: string;
}

interface IOptions {
  generator: {
    excludedProperties?: string[];
  };
}

export default Vue.extend({
  name: 'VeoForm',
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    schema: {
      type: Object,
      required: true
    } as PropOptions<JSONSchema7>,
    ui: {
      type: Object,
      default: undefined
    } as PropOptions<UISchema>,
    disabled: Boolean,
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslationCollection>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslationCollection>,
    options: {
      type: Object,
      default: undefined
    } as PropOptions<IOptions>,
    isValid: {
      type: Boolean
    },
    errorMessages: {
      type: Array,
      default: () => []
    } as PropOptions<IErrorMessageElement[]>,
    reactiveFormActions: {
      type: Array,
      default: () => []
    } as PropOptions<IVeoReactiveFormAction[]>
  },
  data() {
    return {
      localSchema: this.schema,
      localUI: this.ui,
      defaultOptions: {
        generator: {
          excludedProperties: [
            '/id$',
            '/type$',
            '/domains$',
            '/owner$',
            '/href$',
            '/validFrom$',
            '/displayName$',
            '/resourcesUri$',
            '/searchesUri$',
            '/targetUri$',
            '/riskvalues$',
            '/assets$',
            '^#/properties/links',
            '/applicableTo$',
            '/references$',
            '/updatedAt$',
            '/updatedBy$',
            '/createdAt$',
            '/createdBy$',
            '/parts$',
            '/members$',
            '/designator$',
            '/links$',
            '_self'
          ]
        }
      },
      formIsValid: true,
      errorsMsgMap: {} as BaseObject
    };
  },
  computed: {
    validateFunction(): ValidateFunction {
      return ajv.compile(this.localSchema);
    },
    mergedOptions(): IOptions {
      return merge(this.defaultOptions, this.options);
    },
    localReactiveFormActions(): IVeoReactiveFormAction[] {
      return [...this.reactiveFormActions, ...getDefaultReactiveFormActions(this)];
    }
  },
  watch: {
    schema: {
      immediate: true,
      handler() {
        // IMPORTANT! This is needed to update localSchema when schema is updated
        // Else it cannot detect updated object of schema and does not update veo-form
        this.localSchema = JSON.parse(JSON.stringify(this.schema));
        // If no UI has been set, the schema must be considered
        this.updateUI();
        this.validate();
      }
    },
    ui: {
      immediate: true,
      // deep property is important to check for changes in FormSchema to update the form (import for live updates in FormSchemaEditor).
      // if it causes problems or performance issues, should be removed and another solution found
      deep: true,
      handler() {
        this.updateUI();
      }
    },
    generalTranslation: {
      immediate: true,
      handler() {
        if (this.ui) {
          this.localUI = this.translate<UISchema>(this.ui);
        } else if (this.localUI) {
          this.localUI = this.translate<UISchema>(this.localUI);
        }
      }
    },
    customTranslation: {
      immediate: true,
      handler() {
        if (this.ui) {
          this.localUI = this.translate<UISchema>(this.ui);
        } else if (this.localUI) {
          this.localUI = this.translate<UISchema>(this.localUI);
        }
      }
    },
    errorsMsgMap: {
      immediate: true,
      deep: true,
      handler() {
        this.$emit(
          'update:errorMessages',
          Object.entries(this.errorsMsgMap).map(([pointer, message]) => ({
            pointer,
            message
          }))
        );
      }
    }
  },
  methods: {
    validate() {
      this.formIsValid = this.validateFunction(this.value);
      this.errorsMsgMap = !this.formIsValid && this.validateFunction.errors ? this.validateFunction.errors.reduce(this.validationErrorTransform, {}) : {};
      this.$emit('update:isValid', this.formIsValid);
    },
    executeReactiveFormActions(oldObjectData: IBaseObject, newObjectData: IBaseObject) {
      if (oldObjectData) {
        // Only proceed if this isn't triggered after initally loading the data
        for (const reactiveFormAction of this.localReactiveFormActions) {
          let newValue;
          let oldValue;

          try {
            newValue = vjp.get(newObjectData, reactiveFormAction.attributeName);
            oldValue = vjp.get(oldObjectData, reactiveFormAction.attributeName);
          } catch (e) {
            // Default is already set to undefined, so we don't have to do anything here
          }

          if ((!!newValue || !!oldValue) && newValue !== oldValue) {
            reactiveFormAction.handler(newValue, newObjectData, oldObjectData);
          }
        }
      }
      return cloneDeep(newObjectData);
    },
    getLangText(langPointer: string): string {
      const translationKey = langPointer.replace('#lang/', '');
      return this.customTranslation?.[translationKey] || this.generalTranslation?.[translationKey] || translationKey;
    },
    translate<T>(objectWithLangPointers: JSONSchema7 | UISchemaElement): T {
      return JSON.parse(
        JSON.stringify(objectWithLangPointers).replace(/"(#lang\/.*?)"/gi, (_: string, langMatchWithoutQuotes: string) => {
          return JSON.stringify(this.getLangText(langMatchWithoutQuotes));
        })
      );
    },
    setValue(scope: string, v: any) {
      // TODO: check the performance of these lines, which can cause slow input process
      if (scope) {
        const oldValue = cloneDeep(this.value);

        // We clone the current value again to not edit the prop ourselves but let the parent component handle it
        let newValue = cloneDeep(this.value);
        vjp.set(newValue, propertyPath(scope).replace('#/', '/'), v);
        newValue = this.executeReactiveFormActions(oldValue, newValue);
        this.$emit('input', newValue);
        this.$nextTick().then(() => this.validate());
      }
    },
    validationErrorTransform(accummulator: {}, error: ErrorObject) {
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
            translatedErrorString = this.handleRequiredLink(error);
            break;
          }
          translatedErrorString = this.$t(`error.${error.keyword}`, { field: this.getInvalidFieldLabel(missingProperty), format: (error.params as any)[error.keyword] }).toString();
          break;
        // While pattern and format are separate errors, we want to display the same error message for both, as both have to be fixed the same way by the user
        case 'format':
        case 'pattern':
          translatedErrorString = this.$t('error.format', {
            field: this.getInvalidFieldLabel(error.instancePath.split('/').pop() || error.instancePath),
            format: (error.params as any)[error.keyword]
          }).toString();
          break;
        default:
          translatedErrorString = error.message || '';
      }

      return { ...accummulator, [key]: translatedErrorString };
    },
    handleRequiredLink(error: ErrorObject): string {
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
      return this.$t(`error.${error.keyword}_link`, {
        field: this.getInvalidFieldLabel(dataPathParts.pop() || missingProperty),
        position
      }).toString();
    },
    getInvalidFieldLabel(field: string): string {
      return (this.customTranslation && this.customTranslation[field]) || (this.generalTranslation && this.generalTranslation[field]) || field;
    },
    createLayout(element: ILayout, formSchemaPointer: string, elementLevel: number, h: CreateElement, rule: IRule): VNode {
      return h(
        Layout,
        {
          props: {
            options: element.options,
            formSchemaPointer,
            ...rule
          }
        },
        this.createChildren(element, formSchemaPointer, elementLevel, h, this.createComponent)
      );
    },
    createControl(element: IControl, h: CreateElement, rule: IRule): VNode {
      let partOfProps: { [key: string]: any } = {
        name: undefined,
        schema: {},
        value: undefined,
        validation: {},
        generalTranslation: undefined,
        customTranslation: undefined,
        api: {}
      };

      if (element.scope) {
        // as custom links may consist of many rows, the errors needs special handling in order to display the error in their belonging input field (row)
        let linkErrors = undefined as any;
        if (element.scope.includes('link')) {
          const errorKeys = Object.keys(this.errorsMsgMap).filter((errorKey) => errorKey.includes(element.scope!)); // get error keys for all faulty rows of a custom link
          if (errorKeys.length > 0) {
            linkErrors = {};
            for (const errorKey of errorKeys) {
              const indexFromString = errorKey.split('/').find((item) => Number.isInteger(Number(item))) as string | undefined;
              linkErrors[`_${indexFromString || '0'}`] = this.errorsMsgMap[errorKey]; // assign error to belonging index (row) of custom link
            }
          }
        }

        const elementName = element.scope.split('/').pop() as string;
        const elementSchema: any = JsonPointer.get(this.localSchema, element.scope);
        const elementValue: any = JsonPointer.get(this.value, propertyPath(element.scope));

        partOfProps = {
          name: elementName,
          schema: elementSchema ?? {},
          generalTranslation: this.generalTranslation,
          customTranslation: this.customTranslation,
          // TODO: Check InputNumber.vue or other Elements with "clear" and deafult value. Change how default value is used to fix bug
          value: typeof elementValue !== 'undefined' ? elementValue : elementSchema && elementSchema.default,
          validation: {
            objectSchema: {
              errorMsg: this.errorsMsgMap[element.scope] || linkErrors
            }
          }
        };
      }

      return h(Control, {
        props: {
          ...rule,
          elements: element.elements,
          options: { ...element.options, label: this.schema.required?.includes(partOfProps.name) ? element.options?.label + '*' : element.options?.label },
          disabled: this.disabled,
          ...partOfProps
        },
        on: {
          input: (v: any) => element.scope && this.setValue(element.scope, v),
          change: (v: any) => element.scope && this.setValue(element.scope, v)
        }
      });
    },
    createLabel(element: ILabel, h: CreateElement, rule: IRule): VNode {
      return h(Label, {
        props: {
          ...rule,
          options: element.options,
          text: element.text
        }
      });
    },
    createChildren(
      element: UISchemaElement,
      formSchemaPointer: string,
      elementLevel: number,
      h: CreateElement,
      createComponent: (element: UISchemaElement, formSchemaPointer: string, elementLevel: number, h: CreateElement) => VNode
    ) {
      return element.elements && element.elements.map((elem, index) => createComponent(elem, `${formSchemaPointer}/elements/${index}`, elementLevel + 1, h));
    },
    createComponent(element: UISchemaElement, formSchemaPointer: string, elementLevel: number, h: CreateElement): VNode {
      const rule = evaluateRule(this.value, element.rule);
      switch (element.type) {
        case 'Layout':
          return this.createLayout(element, formSchemaPointer, elementLevel, h, rule);
        case 'Control':
          return this.createControl(element, h, rule);
        case 'Label':
          return this.createLabel(element, h, rule);
      }
    },
    updateUI() {
      if (this.ui) {
        this.localUI = this.translate<UISchema>(this.ui);
      } else {
        this.localUI = this.translate<UISchema>(generateFormSchema(this.schema, this.mergedOptions.generator.excludedProperties, Mode.VEO));
      }
    }
  },
  render(h): VNode {
    return h(Wrapper, [this.createComponent(this.localUI, '#', 0, h)]);
  }
});
</script>

<i18n>
{
  "en": {
    "error": {
      "format": "The field \"{field}\" has to match the format \"{format}\"",
      "required": "The field \"{field}\" is required",
      "required_link": "The {position} link in \"{field}\" has to point to an object or must be removed"
    }
  },
  "de": {
    "error": {
      "format": "Das Feld \"{field}\" muss dem Format \"{format}\" entsprechen",
      "required": "Das Feld \"{field}\" muss ausgefüllt sein",
      "required_link": "Der {position} Link in \"{field}\" muss auf ein Objekt zeigen oder entfernt werden"
    }
  }
}
</i18n>

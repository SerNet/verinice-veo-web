<!--
   - verinice.veo web
   - Copyright (C) 2021 Davit Svandize, Jonas Heitmann, Jessica Lühnen
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
import Ajv, { RequiredParams } from 'ajv';
import { merge } from 'lodash';
import { Layout as ILayout, Control as IControl, Label as ILabel, UISchema, UISchemaElement } from '~/types/UISchema';
import { BaseObject, IApi, ajv, propertyPath, generateFormSchema, Mode, evaluateRule, IRule } from '~/components/forms/utils';
import Label from '~/components/forms/Label.vue';
import Control from '~/components/forms/Control.vue';
import Layout from '~/components/forms/Layout.vue';
import Wrapper from '~/components/forms/Wrapper.vue';
import { IVeoTranslationCollection } from '~/types/VeoTypes';

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
    api: {
      type: Object,
      default: undefined
    } as PropOptions<IApi>
  },
  data() {
    return {
      localSchema: this.schema,
      localUI: this.ui,
      defaultOptions: {
        generator: {
          excludedProperties: [
            '/id$',
            '/subType$',
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
            '/extinguishingTime$',
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
            '/customAspects$',
            '/links$'
          ]
        }
      }
    };
  },
  computed: {
    validate(): Ajv.ValidateFunction {
      return ajv.compile(this.localSchema);
    },
    valid(): boolean | PromiseLike<any> {
      return this.validate(this.value);
    },
    errorsMsgMap(): BaseObject {
      return !this.valid && this.validate.errors ? this.validate.errors.reduce(this.validationErrorTransform, {}) : {};
    },
    mergedOptions(): IOptions {
      return merge(this.defaultOptions, this.options);
    }
  },
  watch: {
    schema: {
      immediate: true,
      handler() {
        // IMPORTANT! This is needed to update localSchema when schema is updated
        // Else it cannot detect updated object of schema and does not update veo-form
        this.localSchema = JSON.parse(JSON.stringify(this.schema));
      }
    },
    ui: {
      immediate: true,
      // deep property is important to check for changes in FormSchema to update the form (import for live updates in FormSchemaEditor).
      // if it causes problems or performance issues, should be removed and another solution found
      deep: true,
      handler() {
        if (this.ui) {
          this.localUI = this.translate<UISchema>(this.ui);
        } else {
          this.localUI = this.translate<UISchema>(generateFormSchema(this.schema, this.mergedOptions.generator.excludedProperties, Mode.VEO));
        }
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
    valid: {
      immediate: true,
      handler() {
        this.$emit('update:isValid', this.valid);
      }
    },
    errorsMsgMap: {
      immediate: true,
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
        vjp.set(this.value, propertyPath(scope).replace('#/', '/'), v);
        this.$emit('input', this.value);
      }
    },
    validationErrorTransform(accummulator: {}, error: Ajv.ErrorObject) {
      const keyMatch = error.schemaPath.match(/((.+\/properties\/\w+\b)|(.+(?=\/required)))/g);
      if (!keyMatch) {
        throw new Error('Key does not match in Errors array');
      }

      const key = error.keyword !== 'required' ? keyMatch[0] : `${keyMatch[0]}/properties/${(error.params as RequiredParams).missingProperty}`;
      let translatedErrorString = '';

      switch (error.keyword) {
        case 'required':
          // Special handling of links, as their last data path entry isn't the string we search for
          if ((error.params as any).missingProperty === 'target') {
            const dataPathParts = error.dataPath.split('/');
            dataPathParts.pop();
            translatedErrorString = this.$t(`error.${error.keyword}_link`, {
              field: this.getInvalidFieldLabel(dataPathParts.pop() || (error.params as any).missingProperty)
            }).toString();
            break;
          }
          translatedErrorString = this.$t(`error.${error.keyword}`, { field: this.getInvalidFieldLabel((error.params as any).missingProperty) }).toString();
          break;
        case 'format':
          translatedErrorString = this.$t(`error.${error.keyword}`, {
            field: this.getInvalidFieldLabel(error.dataPath.split('/').pop() || error.dataPath),
            format: (error.params as any)[error.keyword]
          }).toString();
          break;
        case 'pattern':
          // While pattern is a separate error message, we want to display the same error message as for a format error
          translatedErrorString = this.$t('error.format', {
            field: this.getInvalidFieldLabel(error.dataPath.split('/').pop() || error.dataPath),
            format: (error.params as any)[error.keyword]
          }).toString();
          break;
        default:
          translatedErrorString = error.message || '';
      }

      return { ...accummulator, [key]: translatedErrorString };
    },
    getInvalidFieldLabel(field: string): string {
      return this.customTranslation[field] || this.generalTranslation[field] || field;
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
              errorMsg: this.errorsMsgMap[element.scope]
            }
          },
          api: this.api
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
      "required_link": "The link \"{field}\" has to point to an object or be removed"
    }
  },
  "de": {
    "error": {
      "format": "Das Feld \"{field}\" muss dem Format \"{format}\" entsprechen",
      "required": "Das Feld \"{field}\" muss ausgefüllt sein",
      "required_link": "Der Link \"{field}\" muss auf ein Objekt zeigen oder entfernt werden"
    }
  }
}
</i18n>
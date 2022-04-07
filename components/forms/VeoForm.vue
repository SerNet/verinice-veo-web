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
import Vue from 'vue';
import { VNode, PropOptions, CreateElement } from 'vue/types';
import { JSONSchema7 } from 'json-schema';
import { JsonPointer } from 'json-ptr';

import vjp from 'vue-json-pointer';
import { ErrorObject, ValidateFunction } from 'ajv';
import { cloneDeep, dropRight, merge, pull } from 'lodash';
import { Layout as ILayout, IVeoFormSchemaControl, Label as ILabel, UISchema, UISchemaElement } from '~/types/UISchema';
import { BaseObject, ajv, propertyPath, generateFormSchema, Mode, evaluateRule, IRule, generateFormSchemaControl, generateFormSchemaGroup } from '~/components/forms/utils';
import Label from '~/components/forms/Label.vue';
import Control from '~/components/forms/Control.vue';
import Layout from '~/components/forms/Layout.vue';
import Wrapper from '~/components/forms/Wrapper.vue';
import { IVeoDomain, IVeoFormsAdditionalContext, IVeoFormSchemaGeneratorOptions, IVeoFormsControlProps, IVeoReactiveFormAction, IVeoTranslationCollection } from '~/types/VeoTypes';
import { IBaseObject } from '~/lib/utils';
import { getDefaultReactiveFormActions } from '~/components/forms/reactiveFormActions';

interface IErrorMessageElement {
  pointer: string;
  message: string;
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
    domainId: {
      type: String,
      default: undefined
    },
    disabled: Boolean,
    /**
     * If set to true, objects can't be created from within the custom link dropdown
     */
    objectCreationDisabled: {
      type: Boolean,
      default: false
    },
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslationCollection>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslationCollection>,
    isValid: {
      type: Boolean
    },
    disableSubTypeSelect: {
      type: Boolean,
      default: false
    },
    errorMessages: {
      type: Array,
      default: () => []
    } as PropOptions<IErrorMessageElement[]>,
    reactiveFormActions: {
      type: Array,
      default: () => []
    } as PropOptions<IVeoReactiveFormAction[]>,
    additionalContext: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormsAdditionalContext>
  },
  data() {
    return {
      localUI: this.ui,
      formIsValid: true,
      errorsMsgMap: {} as BaseObject,
      domain: undefined as undefined | IVeoDomain
    };
  },
  computed: {
    validateFunction(): ValidateFunction {
      return ajv.compile(this.schema);
    },
    generatorOptions(): IVeoFormSchemaGeneratorOptions {
      return {
        excludedProperties: [
          '/id$',
          '/type$',
          '/owner$',
          '^#/properties/links',
          '/updatedAt$',
          '/updatedBy$',
          '/createdAt$',
          '/createdBy$',
          '/parts$',
          '/members$',
          '/designator$',
          '(\\w+)/properties/domains$',
          '_self'
        ],
        groupedNamespaces: Object.keys((this.schema as any).properties?.customAspects?.properties || {}).map((key) => ({
          namespace: `#/properties/customAspects/properties/${key}`,
          label: key
        })),
        generateControlFunction: generateFormSchemaControl,
        generateGroupFunction: generateFormSchemaGroup
      };
    },
    localReactiveFormActions(): IVeoReactiveFormAction[] {
      return [...this.reactiveFormActions, ...getDefaultReactiveFormActions(this)];
    },
    defaultAdditionalContext(): IVeoFormsAdditionalContext {
      if (this.domainId) {
        return {
          [`#/properties/domains/properties/${this.domainId}/properties/status`]: {
            formSchema: {
              disabled: !this.value.domains?.[this.domainId]?.subType,
              enum: (() => {
                const scope = `#/properties/domains/properties/${this.domainId}/properties/status`;
                let elementSchema: any = cloneDeep(JsonPointer.get(this.schema, scope) || {});
                elementSchema = this.addConditionalSchemaPropertiesToControlSchema(elementSchema, scope);
                return elementSchema?.enum?.map(
                  (status: string) => this.generalTranslation[`${this.schema.title}_${this.value.domains?.[this.domainId]?.subType}_status_${status}`] || status
                );
              })()
            }
          },
          [`#/properties/domains/properties/${this.domainId}/properties/subType`]: {
            formSchema: { disabled: this.disableSubTypeSelect }
          },
          [`#/properties/domains/properties/${this.domainId}/properties/riskValues/properties/DSRA/properties/implementationStatus`]: {
            formSchema: {
              enum: (() => (this.domain?.riskDefinitions?.DSRA?.implementationStateDefinition?.levels || []).map((level: any) => level.name))()
            }
          },
          [`#/properties/domains/properties/${this.domainId}/properties/riskValues/properties/DSRA/properties/potentialProbability`]: {
            formSchema: {
              enum: (() => (this.domain?.riskDefinitions?.DSRA?.probability?.levels || []).map((level: any) => level.name))()
            }
          },
          [`#/properties/domains/properties/${this.domainId}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/C`]: {
            formSchema: {
              enum: (() => (this.domain?.riskDefinitions?.DSRA?.categories?.find((category) => category.id === 'C')?.potentialImpacts || []).map((level: any) => level.name))()
            }
          },
          [`#/properties/domains/properties/${this.domainId}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/I`]: {
            formSchema: {
              enum: (() => (this.domain?.riskDefinitions?.DSRA?.categories?.find((category) => category.id === 'I')?.potentialImpacts || []).map((level: any) => level.name))()
            }
          },
          [`#/properties/domains/properties/${this.domainId}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/A`]: {
            formSchema: {
              enum: (() => (this.domain?.riskDefinitions?.DSRA?.categories?.find((category) => category.id === 'A')?.potentialImpacts || []).map((level: any) => level.name))()
            }
          },
          [`#/properties/domains/properties/${this.domainId}/properties/riskValues/properties/DSRA/properties/potentialImpacts/properties/R`]: {
            formSchema: {
              enum: (() => (this.domain?.riskDefinitions?.DSRA?.categories?.find((category) => category.id === 'R')?.potentialImpacts || []).map((level: any) => level.name))()
            }
          }
        };
      } else {
        return {};
      }
    },
    localAdditionalContext(): IVeoFormsAdditionalContext {
      return { ...this.defaultAdditionalContext, ...this.additionalContext };
    }
  },
  watch: {
    schema: {
      immediate: true,
      handler() {
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
    },
    domainId: {
      handler() {
        this.fetchDomain();
      },
      immediate: true
    }
  },
  methods: {
    async fetchDomain() {
      // ToDo: Workaround for unit tests, find a way to mock when using composition api
      if (this.$api) {
        this.domain = await this.$api.domain.fetch(this.domainId);
      }
    },
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
          translatedErrorString = this.$t(`error.${error.keyword}`, { field: this.getInvalidFieldLabel(missingProperty) }).toString();
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
    createLayout(element: ILayout, formSchemaPointer: string, h: CreateElement, rule: IRule): VNode {
      return h(
        Layout,
        {
          props: {
            options: element.options,
            formSchemaPointer,
            ...rule
          }
        },
        this.createChildren(element, formSchemaPointer, h)
      );
    },
    createControl(element: IVeoFormSchemaControl, h: CreateElement, rule: IRule): VNode {
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
              const indexFromString = errorKey
                .split('/')
                .splice(5)
                .find((item) => Number.isInteger(Number(item))) as string | undefined;
              linkErrors[`_${indexFromString || '0'}`] = this.errorsMsgMap[errorKey]; // assign error to belonging index (row) of custom link
            }
          }
        }

        const elementName = element.scope.split('/').pop() as string;
        let elementSchema: any = cloneDeep(JsonPointer.get(this.schema, element.scope) || {});
        const elementValue: any = JsonPointer.get(this.value, propertyPath(element.scope));

        elementSchema = this.addConditionalSchemaPropertiesToControlSchema(elementSchema, element.scope);

        partOfProps = {
          name: elementName,
          schema: elementSchema,
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

      const additionalFSConditions = element.scope && this.localAdditionalContext[element.scope]?.formSchema;
      const additionalOSContext = element.scope && this.localAdditionalContext[element.scope]?.objectSchema;
      const options = {
        ...element.options,
        ...additionalFSConditions
      };

      return h(Control, {
        props: {
          ...rule,
          elements: element.elements,
          options: {
            ...options,
            label: this.schema.required?.includes(partOfProps.name) ? element.options?.label + '*' : element.options?.label
          },
          disabled: this.disabled || options.disabled,
          objectCreationDisabled: this.objectCreationDisabled,
          ...partOfProps,
          schema: { ...partOfProps.schema, ...additionalOSContext }
        } as IVeoFormsControlProps,
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
    createChildren(element: UISchemaElement, formSchemaPointer: string, h: CreateElement) {
      return element.elements && element.elements.map((elem, index) => this.createComponent(elem, `${formSchemaPointer}/elements/${index}`, h));
    },
    createComponent(element: UISchemaElement, formSchemaPointer: string, h: CreateElement): VNode {
      const rule = evaluateRule(this.value, element.rule);
      switch (element.type) {
        case 'Layout':
          return this.createLayout(element, formSchemaPointer, h, rule);
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
        this.localUI = this.translate<UISchema>(generateFormSchema(this.schema, this.generatorOptions, Mode.VEO));
      }
    },
    getParentPointer(elementPointer: string): string {
      const parentParts = elementPointer.split('/');
      return dropRight(parentParts, 2).join('/');
    },
    addConditionalSchemaPropertiesToControlSchema(initialControlSchema: JSONSchema7, pointer: string) {
      let schema = cloneDeep(initialControlSchema);

      const controlName = pointer.split('/').pop() as string;
      // Search for conditionally applied properties of the new control (based in the parent object in the objectschema)
      const parentPointer = this.getParentPointer(pointer);
      const parentSchema: any = JsonPointer.get(this.schema, parentPointer);

      if (parentSchema) {
        const getSchemaCompositionConditions = (schemaCompositionObject: any) =>
          schemaCompositionObject?.filter((condition: any) => condition.then?.properties?.[controlName] || condition.else?.properties?.[controlName]) || [];

        const conditionsToCheck = [
          ...(parentSchema.then?.properties?.[controlName] || parentSchema.else?.properties?.[controlName] ? [parentSchema] : []),
          ...getSchemaCompositionConditions(parentSchema.allOf),
          ...getSchemaCompositionConditions(parentSchema.AnyOf),
          ...getSchemaCompositionConditions(parentSchema.OneOf)
        ];

        for (const condition of conditionsToCheck) {
          schema = this.getSchemaWithAppliedConditionalSchemaProperties(schema, condition, parentPointer, controlName);
        }
      }

      return schema;
    },
    getSchemaWithAppliedConditionalSchemaProperties(
      initialControlSchema: JSONSchema7,
      ifElseThenBlock: { if?: any; else?: any; then?: any },
      parentPointer: string,
      controlName: string
    ) {
      let schema;
      for (const propertyWithCondition of Object.keys(ifElseThenBlock.if?.properties)) {
        const pathInFormDataParts = pull(parentPointer.split('/'), 'properties', 'attributes');
        pathInFormDataParts.push(propertyWithCondition);
        const pathInFormData = pathInFormDataParts.join('/');

        if (JsonPointer.get(this.value, pathInFormData) === ifElseThenBlock.if.properties[propertyWithCondition].const) {
          schema = merge(initialControlSchema, ifElseThenBlock.then?.properties?.[controlName]);
        } else {
          schema = merge(initialControlSchema, ifElseThenBlock.else?.properties?.[controlName]);
        }
      }
      return schema;
    }
  },
  render(h): VNode {
    return h(Wrapper, [this.createComponent(this.localUI, '#', h)]);
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

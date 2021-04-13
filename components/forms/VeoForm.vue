<script lang="ts">
import Vue, { VNode, PropOptions } from 'vue'
import { JSONSchema7 } from 'json-schema'
import { JsonPointer } from 'json-ptr'

import vjp from 'vue-json-pointer'
import Ajv, { RequiredParams } from 'ajv'
import { chunk, merge } from 'lodash'
import { UISchema, UISchemaElement, UIRule } from '~/types/UISchema'
import { BaseObject, IApi } from '~/components/forms/utils'
import Label from '~/components/forms/Label.vue'
import Control from '~/components/forms/Control.vue'
import Layout from '~/components/forms/Layout.vue'
import Wrapper from '~/components/forms/Wrapper.vue'
import { IVeoFormSchemaTranslationCollectionItem, IVeoTranslation } from '~/types/VeoTypes'

interface IErrorMessageElement {
  pointer: string
  message: string
}

const ajv = new Ajv({
  allErrors: true,
  jsonPointers: true,
  strictKeywords: true
})

enum Mode {
  GENERAL = 'GENERAL',
  VEO = 'VEO'
}

interface IOptions {
  generator: {
    excludedProperties?: string[]
    elementsPerPage?: number
  }
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
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslation>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollectionItem>,
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
      page: 1,
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
            '/customAspects$',
            '/links$'
          ],
          elementsPerPage: -1
        }
      }
    }
  },
  computed: {
    pages(): UISchemaElement[] | undefined {
      if (this.localUI && this.localUI.elements) {
        return this.localUI.elements
          .filter(el => el.type === 'Layout' && el.options && el.options.format === 'page')
          .map((el, i) => ({
            ...el,
            options: { ...el.options, _pageID: i + 1 }
          }))
      }
      return undefined
    },
    visiblePages(): UISchemaElement[] | undefined {
      if (this.pages && this.pages.length >= 1) {
        return this.pages.filter(
          // TODO: it is a question, how Vue knows, what internally (rules) in function changes,
          // it works now, but it can probably cause BUGs, and then needs to pay ATTENTION!!!
          el => this.evaluateRule(el.rule).visible === true
        )
      }
      return undefined
    },
    pagesLength(): number {
      return this.visiblePages ? this.visiblePages.length : 1
    },
    currentPage(): UISchemaElement {
      if (this.localUI && this.localUI.elements && this.visiblePages) {
        return {
          ...this.localUI,
          elements: this.pagesLength > 1 ? [this.visiblePages[this.page - 1]] : [...this.localUI.elements]
        }
      } else {
        return { ...this.localUI }
      }
    },
    validate(): Ajv.ValidateFunction {
      return ajv.compile(this.localSchema)
    },
    valid(): boolean | PromiseLike<any> {
      return this.validate(this.value)
    },
    errorsMsgMap(): BaseObject {
      return !this.valid && this.validate.errors ? this.validate.errors.reduce(this.validationErrorTransform, {}) : {}
    },
    mergedOptions(): IOptions {
      return merge(this.defaultOptions, this.options)
    }
  },
  watch: {
    schema: {
      immediate: true,
      handler() {
        // IMPORTANT! This is needed to update localSchema when schema is updated
        // Else it cannot detect updated object of schema and does not update veo-form
        this.localSchema = JSON.parse(JSON.stringify(this.schema))
      }
    },
    ui: {
      immediate: true,
      // TODO: deep property is important to check for changes in FormSchema to update the form (import for live updates in FormSchemaEditor).
      // if it causes problems or performance issues, should be removed and another solution found
      deep: true,
      handler() {
        if (this.ui) {
          this.localUI = this.translate<UISchema>(this.ui)
        } else {
          this.localUI = this.translate<UISchema>(
            this.generateFormSchema(this.schema, this.mergedOptions.generator.excludedProperties, Mode.VEO)
          )
        }
      }
    },
    generalTranslation: {
      immediate: true,
      handler() {
        // this.localSchema = this.translate<JSONSchema7>(this.schema)
        if (this.ui) {
          this.localUI = this.translate<UISchema>(this.ui)
        } else if (this.localUI) {
          this.localUI = this.translate<UISchema>(this.localUI)
        }
      }
    },
    customTranslation: {
      immediate: true,
      handler() {
        // this.localSchema = this.translate<JSONSchema7>(this.schema)
        if (this.ui) {
          this.localUI = this.translate<UISchema>(this.ui)
        } else if (this.localUI) {
          this.localUI = this.translate<UISchema>(this.localUI)
        }
      }
    },
    visiblePages(newValue: UISchemaElement[] | undefined, oldValue: UISchemaElement[] | undefined) {
      // TODO: Refactor code to make it more readible and clear

      if (typeof oldValue !== 'undefined' && typeof newValue !== 'undefined') {
        // if both oldValue and newValue are defined, only then is important to k

        // get old current page to get old current page ID
        const oldCurrentPage = oldValue[this.page - 1]
        const oldCurrentPageID: number = oldCurrentPage.options && oldCurrentPage.options._pageID

        // Look in the new array of visible pages and find what the index of old current page is
        const currentPageIndexInNewValue = newValue.findIndex(
          el => el.options && el.options._pageID === oldCurrentPageID
        )
        // if the old current page was found in the new visible pages, adjust this.page, else this.page is 1
        this.page = currentPageIndexInNewValue !== -1 ? currentPageIndexInNewValue + 1 : 1
      } else {
        // else set the actual to 1 as default
        this.page = 1
      }
    },
    valid: {
      immediate: true,
      handler() {
        this.$emit('update:isValid', this.valid)
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
        )
      }
    }
  },
  created() {
    if (this.value && this.value.customAspects) {
      const customAspectsProperties = JsonPointer.get(this.localSchema, '#/properties/customAspects/properties') as any
      Object.keys(this.value.customAspects)
        .filter(property => typeof this.value.customAspects[property].type === 'undefined')
        .forEach(property => {
          const type = customAspectsProperties?.[property]?.properties?.type?.enum?.[0]
          if (type) {
            vjp.set(this.value, `/customAspects/${property}/type`, type)
          }
        })
    }
  },
  methods: {
    getLangText(langPointer: string): string {
      const translationKey = langPointer.replace('#lang/', '')
      return this.customTranslation?.[translationKey] || this.generalTranslation?.[translationKey] || ''
    },
    translate<T>(objectWithLangPointers: JSONSchema7 | UISchemaElement): T {
      return JSON.parse(
        JSON.stringify(objectWithLangPointers).replace(
          /"(#lang\/.*?)"/gi,
          (langMatchWithQuotes: string, langMatchWithoutQuotes: string) => {
            return JSON.stringify(this.getLangText(langMatchWithoutQuotes))
          }
        )
      )
    },
    propertyPath(path: string) {
      // TODO: Better translation from #/properties/name to #/name for values
      return String(path || '').replace(/\/properties\//g, '/')
    },
    evaluateRule(rule: UIRule | undefined) {
      const defaults = {
        visible: true,
        disabled: false
      }
      if (!rule) {
        return defaults
      }

      if (!['HIDE', 'SHOW', 'DISABLE', 'ENABLE'].includes(rule.effect)) {
        console.error(
          `Your rule effect "${rule.effect}" is not available!`,
          'Only these rule effects are permitted: "SHOW", "HIDE", "ENABLED", "DISABLED".'
        )
        return defaults
      }

      const v = JsonPointer.get(this.value, this.propertyPath(rule.condition.scope))

      // if rule condition is true
      if (ajv.validate(rule.condition.schema, v)) {
        switch (rule.effect) {
          case 'HIDE':
            return { ...defaults, visible: false }
          case 'SHOW':
            return { ...defaults, visible: true }
          case 'DISABLE':
            return { ...defaults, disabled: true }
          case 'ENABLE':
            return { ...defaults, disabled: false }
        }
      } else {
        // if rule condition is false
        // This means that SHOW and ENANBLE must be deactivated, because of above defined defaults
        switch (rule.effect) {
          case 'HIDE':
            return { ...defaults }
          case 'SHOW':
            return { ...defaults, visible: false }
          case 'DISABLE':
            return { ...defaults }
          case 'ENABLE':
            return { ...defaults, disabled: true }
        }
      }

      return defaults
    },
    setValue(scope: string, v: any) {
      if (scope) {
        // TODO: Here was changed JsonPointer with Vue.set() because of reactivity
        // Investigate how to work with it JsonPointer, because of JsonPaths
        // but have vue reactivity

        // console.log(this.value, scope, propertyPath(scope), v );
        // JsonPointer.set(this.value, propertyPath(scope), v, true);

        vjp.set(this.value, this.propertyPath(scope).replace('#/', '/'), v)
        this.$emit('input', this.value)
      }
    },
    validationErrorTransform(accummulator: {}, error: Ajv.ErrorObject) {
      const keyMatch = error.schemaPath.match(/((.+\/properties\/\w+\b)|(.+(?=\/required)))/g)
      if (!keyMatch) {
        throw new Error('Key does not match in Errors array')
      }

      const key =
        error.keyword !== 'required'
          ? keyMatch[0]
          : `${keyMatch[0]}/properties/${(error.params as RequiredParams).missingProperty}`

      return { ...accummulator, [key]: error.message }
    },
    generateControl(scope: string, items: BaseObject, mode: Mode = Mode.GENERAL): UISchemaElement {
      const propertyName = scope.split('/').pop()
      const label = propertyName ? (mode === Mode.VEO ? `#lang/${propertyName}` : propertyName) : ''
      return {
        type: 'Control',
        scope,
        options: {
          label
        },
        // Add property only if condition(here: items[scope]) is true https://stackoverflow.com/a/40560953/6072503
        ...(items[scope] && {
          elements: items[scope].map(this.generateControl)
        })
      }
    },
    generateGroups(content: UISchemaElement[], scopes: string[]) {
      const regCustomAspect = /#\/properties\/customAspects\/properties\/\w+/
      const uniqueCustomAspects = [
        ...new Set(
          scopes
            .filter(scope => scope.includes('#/properties/customAspects/properties'))
            .map(scope => {
              const matchedCustomAspect = scope.match(regCustomAspect)
              return matchedCustomAspect && matchedCustomAspect[0]
            })
        )
      ] as string[]

      return [
        ...content.filter((el: any) => el.scope && !regCustomAspect.test(el.scope)),
        ...uniqueCustomAspects.map(uniqueCustomAspect => {
          return {
            type: 'Layout',
            options: {
              type: 'group',
              direction: 'vertical',
              label: uniqueCustomAspect.split('/').pop()
            },
            elements: [...content.filter((el: any) => el.scope && el.scope.includes(uniqueCustomAspect))]
          }
        })
      ] as UISchemaElement[]
    },
    generatePages(content: UISchemaElement[]) {
      return chunk(content, this.mergedOptions.generator.elementsPerPage).map(
        (pageContent): UISchemaElement => ({
          type: 'Layout',
          options: {
            format: 'page'
          },
          elements: pageContent
        })
      )
    },
    generateFormSchema(objectSchema: JSONSchema7, excludedProperties: string[] = [], mode: Mode = Mode.GENERAL): any {
      const items: BaseObject = {}
      // @ts-ignore
      let schemaMap = Object.keys(JsonPointer.flatten(objectSchema, '#')) // TODO: Is '#' the right argument?
      const excludedPropertiesRegexp = excludedProperties.map(prop => new RegExp(prop))
      schemaMap =
        excludedPropertiesRegexp.length > 0
          ? schemaMap.filter(el => !excludedPropertiesRegexp.some(reg => reg.test(el)))
          : schemaMap
      const scopes = schemaMap
        .filter(el => /#\/(\w|\/)*properties\/\w+$/g.test(el))
        .filter((el, i, arr) => !arr.some(someEl => new RegExp(String.raw`${el}/properties/\w+`, 'g').test(someEl)))
        .filter(el => {
          if (/\/properties\/\w+\/items\/properties\/\w+$/g.test(el)) {
            const [parent, child] = el.split(/\/items(?=\/properties\/\w+$)/g)
            items[parent] = items[parent] ? [...items[parent], `#${child}`] : [`#${child}`]
            return false
          } else {
            return true
          }
        })
      let content = scopes.map(scope => this.generateControl(scope, items, mode))

      // Generate Groups for each customAspect
      content = this.generateGroups(content, scopes)

      content = this.mergedOptions.generator.elementsPerPage === -1 ? content : this.generatePages(content)
      return {
        type: 'Layout',
        options: {
          format: 'group',
          direction: 'vertical'
        },
        elements: content
      }
    }
  },
  render(h): VNode {
    const createComponent = (element: UISchemaElement, formSchemaPointer: string, elementLevel: number): VNode => {
      const createChildren = () => {
        return (
          element.elements &&
          element.elements.map((elem, index) =>
            createComponent(elem, `${formSchemaPointer}/elements/${index}`, elementLevel + 1)
          )
        )
      }

      const rule = this.evaluateRule(element.rule)

      switch (element.type) {
        case 'Layout':
          return h(
            Layout,
            {
              props: {
                options: element.options,
                formSchemaPointer,
                ...rule
              }
            },
            createChildren()
          )
        case 'Control': {
          let partOfProps: { [key: string]: any } = {
            name: undefined,
            schema: {},
            value: undefined,
            validation: {},
            generalTranslation: undefined,
            customTranslation: undefined,
            api: {}
          }

          if (element.scope) {
            const elementName = element.scope.split('/').pop() as string
            const elementSchema = JsonPointer.get(this.localSchema, element.scope) as any
            const elementValue = JsonPointer.get(this.value, this.propertyPath(element.scope)) as any
            const elementParentSchema = JsonPointer.get(this.localSchema, '#') as any
            const isRequired =
              Array.isArray(elementParentSchema.required) && elementParentSchema.required.includes(elementName)

            partOfProps = {
              name: elementName,
              schema: elementSchema,
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
            }
          }
          return h(Control, {
            props: {
              ...rule,
              elements: element.elements,
              options: element.options,
              ...partOfProps
            },
            on: {
              input: (v: any) => element.scope && this.setValue(element.scope, v),
              change: (v: any) => element.scope && this.setValue(element.scope, v)
            }
          })
        }
        case 'Label':
          return h(Label, {
            props: {
              ...rule,
              options: element.options,
              text: element.text
            }
          })
      }
    }

    return h(
      Wrapper,
      {
        props: {
          page: this.page,
          length: this.pagesLength
        },
        on: {
          input: (v: any) => (this.page = v)
        }
      },
      [createComponent(this.currentPage, '#', 0)]
    )
  }
})
</script>

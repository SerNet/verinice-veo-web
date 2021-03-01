<script lang="ts">
// import NestedDraggable from '~/components/editor/FormSchema/NestedDraggable.vue'
import Vue, { VNode, PropOptions } from 'vue'
import { JSONSchema7 } from 'json-schema'
import { JsonPointer } from 'json-ptr'

import vjp from 'vue-json-pointer'
import FseLabel from './elements/FseLabel.vue'
import FseControl from './elements/FseControl.vue'
import FseLayout from './elements/FseLayout.vue'
import { UISchema, UISchemaElement } from '~/types/UISchema'
import { BaseObject } from '~/components/forms/utils'
import { IVeoTranslation } from '~/types/VeoTypes'
import {
  IVEOFormSchemaCustomTranslationEvent,
  IVEOFormSchemaItemDeleteEvent,
  IVEOFormSchemaItemUpdateEvent,
  IVEOFormSchemaTranslationCollectionItem
} from 'veo-formschema'
// import Wrapper from '~/components/forms/Wrapper.vue'

export default Vue.extend({
  name: 'FseGenerator',
  props: {
    schema: {
      type: Object,
      required: true
    } as PropOptions<JSONSchema7>,
    value: {
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
    } as PropOptions<IVEOFormSchemaTranslationCollectionItem>
  },
  data() {
    return {
      page: 1,
      localSchema: this.schema,
      localUI: this.value
    }
  },
  computed: {
    pages(): UISchemaElement[] | undefined {
      if (this.value && this.value.elements) {
        return this.value.elements
          .filter(el => el.type === 'Layout' && el.options && el.options.format === 'page')
          .map((el, i) => ({
            ...el,
            options: { ...el.options, _pageID: i + 1 }
          }))
      }
      return undefined
    },
    pagesLength(): number {
      return this.pages ? this.pages.length : 1
    }
  },
  watch: {
    schema: {
      immediate: true,
      deep: true,
      handler() {
        // IMPORTANT! This is needed to update localSchema when schema is updated
        // Else it cannot detect updated object of schema and does not update veo-form
        this.localSchema = JSON.parse(JSON.stringify(this.schema))
      }
    },
    lang: {
      immediate: true,
      handler() {}
    }
  },
  methods: {
    propertyPath(path: string) {
      // TODO: Better translation from #/properties/name to #/name for values
      return String(path || '').replace(/\/properties\//g, '/')
    },
    setValue(scope: string, v: any): any {
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
    onDelete(event: IVEOFormSchemaItemDeleteEvent): void {
      this.$emit('delete', event)
    },
    onUpdate(event: IVEOFormSchemaItemUpdateEvent): void {
      this.$emit('update', event)
    },
    onUpdateCustomTranslation(event: IVEOFormSchemaCustomTranslationEvent): void {
      this.$emit('update-custom-translation', event)
    }
  },
  render(h): VNode {
    const createComponent = (element: UISchemaElement, formSchemaPointer: string, elementLevel: number): VNode => {
      // Create children of layout "elements"
      const createChildren = () => {
        return (
          element.elements &&
          element.elements.map((elem, index) =>
            createComponent(elem, `${formSchemaPointer}/elements/${index}`, elementLevel + 1)
          )
        )
      }

      switch (element.type) {
        case 'Layout':
          return h(
            FseLayout,
            {
              props: {
                options: element.options,
                value: element,
                formSchemaPointer,
                level: elementLevel,
                name: element.options?.label?.replace('#lang/', ''),
                customTranslation: this.customTranslation
              },
              on: {
                delete: (event: IVEOFormSchemaItemDeleteEvent) => this.onDelete(event),
                update: (event: IVEOFormSchemaItemUpdateEvent) => this.onUpdate(event),
                'update-custom-translation': (event: IVEOFormSchemaCustomTranslationEvent) =>
                  this.onUpdateCustomTranslation(event)
              }
            },
            createChildren()
          )
        case 'Control': {
          let partOfProps: { [key: string]: any } = {
            name: undefined,
            schema: {},
            formSchemaPointer,
            generalTranslation: {},
            customTranslation: {}
          }

          if (element.scope) {
            const elementName = element.scope.split('/').pop() as string
            const elementSchema = JsonPointer.get(this.localSchema, element.scope) as any
            const elementValue = JsonPointer.get(this.value, this.propertyPath(element.scope)) as any
            const elementParentSchema = JsonPointer.get(this.localSchema, '#') as any
            const isRequired =
              Array.isArray(elementParentSchema.required) && elementParentSchema.required.includes(elementName)

            partOfProps = {
              ...partOfProps,
              value: element,
              name: elementName,
              schema: elementSchema,
              generalTranslation: this.generalTranslation,
              customTranslation: this.customTranslation
            }
          }
          return h(FseControl, {
            props: {
              elements: element.elements,
              options: element.options,
              ...partOfProps,
              scope: element.scope || ''
            },
            on: {
              delete: (event: IVEOFormSchemaItemDeleteEvent) => this.onDelete(event),
              update: (event: IVEOFormSchemaItemUpdateEvent) => this.onUpdate(event),
              'update-custom-translation': (event: IVEOFormSchemaCustomTranslationEvent) =>
                this.onUpdateCustomTranslation(event)
            }
          })
        }
        case 'Label':
          return h(FseLabel, {
            props: {
              options: element.options,
              value: element,
              name: element.text.replace('#lang/', ''),
              text: element.text,
              formSchemaPointer,
              customTranslation: this.customTranslation
            },
            on: {
              delete: (event: IVEOFormSchemaItemDeleteEvent) => this.onDelete(event),
              update: (event: IVEOFormSchemaItemUpdateEvent) => this.onUpdate(event),
              'update-custom-translation': (event: IVEOFormSchemaCustomTranslationEvent) =>
                this.onUpdateCustomTranslation(event)
            }
          })
      }
    }

    if (!this.value) {
      // If value (FormSchema) is not defined, "<!-- -->" will rendered
      // TODO: null causes problems with VNode type without "as any". Look for other solutions if possible
      return null as any
    }

    return createComponent(this.value, '#', 0)
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';
</style>

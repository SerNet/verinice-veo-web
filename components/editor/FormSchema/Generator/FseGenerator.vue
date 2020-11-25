<script lang="ts">
// import NestedDraggable from '~/components/editor/FormSchema/NestedDraggable.vue'
import Vue, { VNode, PropOptions } from 'vue'
import { JSONSchema7, JSONSchema7Object, JSONSchema7Type } from 'json-schema'
import { JsonPointer } from 'json-ptr'

import vjp from 'vue-json-pointer'
import Ajv, { RequiredParams } from 'ajv'
import { chunk, merge } from 'lodash'
import { UISchema, UISchemaElement, UIRule } from '~/types/UISchema'
import { BaseObject, IApi } from '~/components/forms/utils'
import FseLabel from './elements/FseLabel.vue'
import FseControl from './elements/FseControl.vue'
import FseLayout from './elements/FseLayout.vue'
import { IUsedAndUnusedObjectSchemaProperties } from '../FormSchemaEditor.vue'
// import Wrapper from '~/components/forms/Wrapper.vue'

import Draggable from 'vuedraggable'

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
    lang: {
      type: Object,
      default: undefined
    } as PropOptions<BaseObject>,
    objectSchemaProperties: {
      type: Object
    } as PropOptions<IUsedAndUnusedObjectSchemaProperties>
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
          .filter(
            el =>
              el.type === 'Layout' && el.options && el.options.format === 'page'
          )
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
  created() {},
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
    onDelete(event: any, formSchemaPointer: string): void {
      let vjpPointer = formSchemaPointer.replace('#', '')
      // Not allowed to make changes on the root object
      if (formSchemaPointer !== '#') {
        vjp.remove(this.value, vjpPointer)
      } else {
        this.$emit('delete', undefined)
      }
    }
  },
  render(h): VNode {
    const createComponent = (
      element: UISchemaElement,
      formSchemaPointer: string
    ): VNode => {
      // Create children of layout "elements"
      const createChildren = () => {
        return (
          element.elements &&
          element.elements.map((elem, index) =>
            createComponent(elem, `${formSchemaPointer}/elements/${index}`)
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
                formSchema: element,
                formSchemaPointer
              },
              on: {
                delete: (event: any) => this.onDelete(event, formSchemaPointer)
              }
            },
            createChildren()
          )
        case 'Control': {
          let partOfProps: { [key: string]: any } = {
            name: undefined,
            schema: {},
            formSchema: element,
            formSchemaPointer,
            lang: {}
          }

          if (element.scope) {
            const elementName = element.scope.split('/').pop() as string
            const elementSchema = JsonPointer.get(
              this.localSchema,
              element.scope
            ) as any
            const elementValue = JsonPointer.get(
              this.value,
              this.propertyPath(element.scope)
            ) as any
            const elementParentSchema = JsonPointer.get(
              this.localSchema,
              '#'
            ) as any
            const isRequired =
              Array.isArray(elementParentSchema.required) &&
              elementParentSchema.required.includes(elementName)

            partOfProps = {
              name: elementName,
              schema: elementSchema,
              lang: this.lang
              // TODO: Check InputNumber.vue or other Elements with "clear" and deafult value. Change how default value is used to fix bug
            }
          }
          return h(FseControl, {
            props: {
              elements: element.elements,
              options: element.options,
              ...partOfProps
            },
            on: {
              delete: (event: any) => this.onDelete(event, formSchemaPointer)
            }
          })
        }
        case 'Label':
          return h(FseLabel, {
            props: {
              options: element.options,
              value: element,
              text: element.text
            }
          })
      }
    }

    if (!this.value) {
      // If value (FormSchema) is not defined, "<!-- -->" will rendered
      // TODO: null causes problems with VNode type without "as any". Look for other solutions if possible
      return null as any
    }

    return createComponent(this.value, '#')
  }
})
</script>

<style lang="scss" scoped>
@import '~/assets/vuetify.scss';

.veo-editor-header {
  background-color: white;
  border-bottom: 2px solid $grey;
  position: sticky;
  top: 0;
  z-index: 2;
  max-height: 200px;
  overflow: auto;
}

.veo-editor-header ::v-deep .v-expansion-panel-header {
  min-height: auto;
}
.veo-editor-header
  ::v-deep
  .v-expansion-panel--active
  > .v-expansion-panel-header {
  min-height: auto;
}

// .veo-editor-body ::v-deep .v-card {
//   border: 1px solid $grey-darken-2 !important;
// }
</style>

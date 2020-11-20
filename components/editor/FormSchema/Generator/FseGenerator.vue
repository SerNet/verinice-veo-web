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
    } as PropOptions<BaseObject>
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
      if (this.localUI && this.localUI.elements) {
        return this.localUI.elements
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
      handler() {
        // IMPORTANT! This is needed to update localSchema when schema is updated
        // Else it cannot detect updated object of schema and does not update veo-form
        this.localSchema = JSON.parse(JSON.stringify(this.schema))
      }
    },
    value: {
      immediate: true,
      handler() {
        if (this.value) {
          this.localUI = JSON.parse(JSON.stringify(this.value))
        }
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
    }
  },
  render(h): VNode {
    const createComponent = (element: UISchemaElement): VNode => {
      const createChildren = () => {
        return (
          element.elements &&
          element.elements.map(elem => createComponent(elem))
        )
      }

      switch (element.type) {
        case 'Layout':
          return h(
            FseLayout,
            { props: { options: element.options } },
            createChildren()
          )
        case 'Control': {
          let partOfProps: { [key: string]: any } = {
            name: undefined,
            schema: {},
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
              input: (v: any) =>
                element.scope && this.setValue(element.scope, v),
              change: (v: any) =>
                element.scope && this.setValue(element.scope, v)
            }
          })
        }
        case 'Label':
          return h(FseLabel, {
            props: {
              options: element.options,
              text: element.text
            }
          })
      }
    }

    if (!this.localUI) {
      this.localUI = {
        type: 'Layout',
        options: {
          format: 'group',
          direction: 'vertical',
          highlight: false
        }
      }
    }

    return createComponent(this.localUI)
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

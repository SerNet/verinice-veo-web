<script lang="ts">
import Vue from 'vue'
import { PropOptions } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { UISchemaElement } from '@/types/UISchema'

import * as InputText from './InputText.vue'
import * as InputNumber from './InputNumber.vue'
import * as InputTextMultiline from './InputTextMultiline.vue'
import * as Checkbox from './Checkbox.vue'
import * as Select from './Select.vue'
import * as Autocomplete from './Autocomplete.vue'
import * as ArrayField from './ArrayField.vue'
import * as InputDate from './InputDate.vue'
import * as Radio from './Radio.vue'
import * as Tags from './Tags.vue'
import * as MarkdownEditor from './MarkdownEditor.vue'
import * as InputUri from './InputUri.vue'
import * as InputDateTime from './InputDateTime.vue'
import * as LinksField from './LinksField.vue'
import { ContextListener } from '~/components/forms/Collection/utils/helpers'
import { IApi } from '~/components/forms/utils'
import {
  IVeoFormSchemaTranslationCollectionItem,
  IVeoTranslation
} from '~/types/VeoTypes'

const components = [
  InputText,
  InputNumber,
  InputTextMultiline,
  Checkbox,
  Select,
  Autocomplete,
  ArrayField,
  InputDate,
  Radio,
  Tags,
  MarkdownEditor,
  InputUri,
  InputDateTime,
  LinksField
]

export default Vue.extend({
  name: 'FormElement',
  functional: true,
  props: {
    value: {
      type: undefined,
      default: () => undefined
    },
    name: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: () => undefined
    } as PropOptions<JSONSchema7>,
    options: {
      type: Object,
      default: () => undefined
    },
    validation: {
      type: Object,
      default: () => undefined
    },
    disabled: Boolean,
    visible: Boolean,
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslation>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollectionItem>,
    elements: {
      type: Array,
      default: () => []
    } as PropOptions<UISchemaElement[]>,
    api: {
      type: Object,
      default: () => undefined
    } as PropOptions<IApi>
  },
  render(h, context) {
    const props = context.props

    function appropriateComponent() {
      return components.sort(
        (a: any, b: any) => b.helpers.matchingScore({ ...props }) - a.helpers.matchingScore({ ...props })
      )[0].default
    }

    return h(
      appropriateComponent(),
      {
        props: { ...props },
        on: {
          input: (event: any): void => {
            // TODO: What is here really going on? Why do I need this and how can use it better? What does it really?
            // context.parent.$emit("input", $event); -> Alternative
            // TODO: Why does it have Call Stack problems if I don't use Following Commented Code
            // const emitInput = context.listeners.input
            // emitInput($event);

            // TODO: It Calls every event 2 times, but it must call it only once
            ;(context.listeners.input as ContextListener)(event)
          },
          change: (event: any): void => {
            ;(context.listeners.change as ContextListener)(event)
          }
        }
      },
      context.children
    )
  }
})
</script>

<style scoped></style>

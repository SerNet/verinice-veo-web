<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { UISchemaElement } from '@/types/UISchema'

import * as FseInputText from './FseInputText.vue'
import * as FseInputNumber from './FseInputNumber.vue'
import * as FseInputTextMultiline from './FseInputTextMultiline.vue'
import * as FseCheckbox from './FseCheckbox.vue'
import * as FseSelect from './FseSelect.vue'
import * as FseAutocomplete from './FseAutocomplete.vue'
import * as FseArrayField from './FseArrayField.vue'
import * as FseInputDate from './FseInputDate.vue'
import * as FseRadio from './FseRadio.vue'
import * as FseTags from './FseTags.vue'
import * as FseMarkdownEditor from './FseMarkdownEditor.vue'
import * as FseInputUri from './FseInputUri.vue'
import * as FseInputDateTime from './FseInputDateTime.vue'
import * as FseLinksField from './FseLinksField.vue'
import { ContextListener } from '~/components/forms/Collection/utils/helpers'
import { BaseObject, IApi } from '~/components/forms/utils'

const components = [
  FseInputText,
  FseInputNumber,
  FseInputTextMultiline,
  FseCheckbox,
  FseSelect,
  FseAutocomplete,
  FseArrayField,
  FseInputDate,
  FseRadio,
  FseTags,
  FseMarkdownEditor,
  FseInputUri,
  FseInputDateTime,
  FseLinksField
]

export default Vue.extend({
  name: 'FseFormElement',
  functional: true,
  props: {
    name: String,
    schema: Object as Prop<JSONSchema7>,
    lang: Object as Prop<BaseObject>,
    options: Object,
    elements: Array as Prop<UISchemaElement[]>,
    value: {
      type: Object,
      default: () => undefined
    },
    formSchemaPointer: String,
    disabled: Boolean,
    visible: Boolean
  },
  render(h, context) {
    const props = context.props

    function appropriateComponent() {
      return components.sort(
        (a: any, b: any) =>
          b.helpers.matchingScore({ ...props }) -
          a.helpers.matchingScore({ ...props })
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
          },
          delete: (event: any): void => {
            ;(context.listeners.delete as ContextListener)(event)
          }
        }
      },
      context.children
    )
  }
})
</script>

<style scoped></style>

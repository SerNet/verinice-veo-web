<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { UISchemaElement } from '@/types/UISchema'

import * as Group from './Group.vue'
import * as Page from './Page.vue'
import { ContextListener } from '~/components/forms/Collection/utils/helpers'

const components = [Group, Page]

export default Vue.extend({
  name: 'LayoutFormat',
  functional: true,
  props: {
    options: Object,
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
          }
        }
      },
      context.children
    )
  }
})
</script>

<style scoped></style>

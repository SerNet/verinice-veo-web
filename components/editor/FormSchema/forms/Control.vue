<template>
  <v-col class="vf-control">
    <FormElement
      v-bind="$props"
      @input="$emit('input', $event)"
      @change="$emit('input', $event)"
    />
  </v-col>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { UISchemaElement } from '@/types/UISchema'
import { BaseObject, IApi } from '~/components/editor/FormSchema/forms/utils'
import FormElement from '~/components/editor/FormSchema/forms/Collection/FormElements/FormElement.vue'

export default Vue.extend({
  components: {
    FormElement
  },
  props: {
    name: { type: String, default: '' },
    schema: { type: Object, default: () => undefined } as PropOptions<JSONSchema7>,
    lang: { type: Object, default: () => undefined } as PropOptions<BaseObject>,
    elements: { type: Array, default: () => [] } as PropOptions<UISchemaElement[]>,
    options: { type: Object, default: () => undefined },
    value: { type: undefined, default: () => undefined },
    validation: { type: Object, default: () => undefined },
    disabled: Boolean,
    visible: Boolean,
    api: { type: Object, default: () => undefined } as PropOptions<IApi>
  }
})
</script>

<template>
  <v-col cols="12" md="auto" class="vf-control">
    <FormElement v-bind="$props" @input="$emit('input', $event)" @change="$emit('input', $event)" />
  </v-col>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { JSONSchema7 } from 'json-schema'
import { UISchemaElement } from '@/types/UISchema'
import { BaseObject, IApi } from '~/components/forms/utils'
import FormElement from '~/components/forms/Collection/FormElements/FormElement.vue'

export default Vue.extend({
  components: {
    FormElement
  },
  props: {
    name: { type: String, default: '' },
    schema: {
      type: Object,
      default: () => undefined
    } as PropOptions<JSONSchema7>,
    lang: {
      type: Object,
      default: () => undefined
    } as PropOptions<BaseObject>,
    elements: {
      type: Array,
      default: () => []
    } as PropOptions<UISchemaElement[]>,
    options: {
      type: Object,
      default: () => undefined
    },
    value: {
      type: undefined,
      default: () => undefined
    },
    validation: {
      type: Object,
      default: () => undefined
    },
    disabled: Boolean,
    visible: Boolean,
    api: {
      type: Object,
      default: () => undefined
    } as PropOptions<IApi>
  }
})
</script>

<style lang="scss" scoped>
::v-deep {
  .v-input--selection-controls {
    margin-top: 0 !important;
  }
  .vf-form-element .mdi-close {
    opacity: 0;
  }
  .vf-form-element:not(.vf-array-field):not(.vf-links-field):hover .mdi-close {
    opacity: 1;
  }

  .vf-form-element .mdi-close.primary--text,
  .vf-form-element .mdi-close.error--text {
    color: rgba(0, 0, 0, 0.54) !important;
    caret-color: rgba(0, 0, 0, 0.54) !important;
  }
}
</style>

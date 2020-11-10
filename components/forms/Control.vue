<template>
  <div class="vf-control">
    <FormElement
      v-bind="$props"
      @input="$emit('input', $event)"
      @change="$emit('input', $event)"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { Prop } from 'vue/types/options'
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
  .vf-autocomplete,
  .vf-input-date,
  .vf-input-date-time,
  .vf-input-number,
  .vf-input-text,
  .vf-input-text-multiline,
  .vf-input-uri,
  .vf-markdown-editor,
  .vf-select,
  .vf-tags {
    margin-top: 10px !important;
    margin-bottom: 10px !important;
  }

  .vf-array-field,
  .vf-checkbox,
  .vf-links-field,
  .vf-radio {
    margin-bottom: 10px;
  }
}
</style>

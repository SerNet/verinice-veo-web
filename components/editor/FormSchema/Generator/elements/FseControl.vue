<template>
  <div class="vf-control">
    <FseFormElement
      v-bind="$props"
      v-on="$listeners"
      @change="$emit('input', $event)"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { JSONSchema7 } from 'json-schema'
import { UISchemaElement } from '@/types/UISchema'
import FseFormElement from './Collection/FseFormElement.vue'
import { BaseObject } from '~/components/forms/utils'

export default Vue.extend({
  components: {
    FseFormElement
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
      type: Object,
      default: () => undefined
    },
    formSchemaPointer: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: true
    },
    scope: {
      type: String,
      default: ''
    }
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

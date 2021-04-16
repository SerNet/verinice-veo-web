<template>
  <div v-if="visible" class="vf-input-text-multiline vf-form-element">
    <ValidationProvider v-slot="{ errors }" :name="options && options.label" :rules="validation">
      <v-textarea
        ref="textarea"
        :disabled="disabled"
        :value="value"
        :error-messages="errors[0]"
        :label="options && options.label"
        :class="options && options.class"
        :style="options && options.style"
        dense
        hide-details="auto"
        clearable
        auto-grow
        rows="3"
        @input="$emit('input', $event)"
        @change="$emit('input', $event)"
        @click:clear="clear"
      />
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue'
import { PropOptions } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'

export default (Vue as VueConstructor<Vue & { $refs: { textarea: any } }>).extend({
  name: 'InputTextMultiline',
  props: {
    value: String,
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
    visible: Boolean
  },
  computed: {
    textareaCSS(): CSSStyleDeclaration {
      return window.getComputedStyle(this.$refs.textarea.$refs.input)
    },
    lineHeight() {
      // TODO: review code and test, if this is convenient way to get textarea line-height
      const lineHeight: string = this.textareaCSS.getPropertyValue('line-height')
      const lineHeightNumber = parseFloat(lineHeight)
      return lineHeightNumber
        ? {
            value: lineHeightNumber,
            unit: lineHeight.replace(lineHeightNumber.toString(), '')
          }
        : undefined
    },
    paddingHeight(): number {
      return [this.textareaCSS.getPropertyValue('padding-top')].map(el => parseFloat(el)).reduce((a, b) => a + b, 0)
    },
    maxRows(): number {
      return this.options && this.options.maxRows ? (this.options.maxRows as number) : 10
    },
    maxHeight(): string {
      if (this.lineHeight) {
        return `calc(${this.maxRows * this.lineHeight.value}${this.lineHeight.unit} + ${this.paddingHeight}px)`
      } else {
        return ''
      }
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          if (val) {
            if (this.$refs.textarea) {
              this.$refs.textarea.$refs.input.style.maxHeight = this.maxHeight
            } else {
              console.warn('Could not find $refs.textarea element in InputTextMultiline')
            }
          }
        })
      }
    }
  },
  methods: {
    clear() {
      this.$nextTick(() => this.$nextTick(() => this.$emit('input', undefined)))
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      props.schema.type === 'string',
      typeof props.options !== 'undefined' && props.options.format === 'multiline'
    ])
  }
}
</script>

<style lang="scss" scoped>
.v-text-field >>> .v-input__control > .v-input__slot textarea {
  overflow: auto;
}
</style>

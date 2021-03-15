<template>
  <div v-if="visible" class="vf-input-number vf-form-element">
    <ValidationProvider v-slot="{ errors }" :name="options && options.label" :rules="validation">
      <v-text-field
        :disabled="disabled"
        :value="value"
        :error-messages="errors[0]"
        :label="options && options.label"
        type="number"
        :class="options && options.class"
        :style="options && options.style"
        dense
        hide-details="auto"
        clearable
        @input="onInput($event)"
        @change="onInput($event)"
        @click:clear="clear"
      />
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropOptions } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers'

export default Vue.extend({
  name: 'InputNumber',
  props: {
    value: Number,
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
  methods: {
    clear() {
      this.$nextTick(() => this.$nextTick(() => this.$emit('input', undefined)))
    },
    onInput(event: any): void {
      const n = parseFloat(event)
      this.$emit('input', isNaN(n) ? event : n)
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([props.schema.type === 'number' || props.schema.type === 'integer'])
  }
}
</script>

<style lang="scss" scoped></style>

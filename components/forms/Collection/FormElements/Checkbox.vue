<template>
  <div v-if="visible" class="vf-checkbox vf-form-element">
    <ValidationProvider v-slot="{ errors }" :name="options && options.label" :rules="validation">
      <v-checkbox
        :input-value="value"
        :error-messages="errors[0]"
        :disabled="disabled"
        :label="options && options.label"
        :class="options && options.class"
        :style="options && options.style"
        :indeterminate="indeterminate"
        color="primary"
        dense
        hide-details="auto"
        @input="$emit('input', $event)"
        @change="$emit('input', $event)"
      >
        <div slot="append">
          <v-icon @click="clear">mdi-close</v-icon>
        </div>
      </v-checkbox>
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropOptions } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers'

export default Vue.extend({
  name: 'Checkbox',
  props: {
    value: Boolean,
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
  data() {
    return {
      indeterminate: this.value === undefined
    }
  },
  watch: {
    value(val) {
      this.$nextTick(() => {
        return (this.indeterminate = val === undefined)
      })
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
    return calculateConditionsScore([props.schema.type === 'boolean'])
  }
}
</script>

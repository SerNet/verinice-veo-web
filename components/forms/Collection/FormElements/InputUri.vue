<template>
  <div v-if="visible" class="vf-input-uri vf-form-element">
    <ValidationProvider v-slot="{ errors }" :name="options && options.label" :rules="validation">
      <v-text-field
        :disabled="disabled"
        :value="value"
        :error-messages="errors[0]"
        :label="options && options.label"
        :class="options && options.class"
        :style="options && options.style"
        dense
        hide-details="auto"
        clearable
        @input="$emit('input', $event)"
        @change="$emit('input', $event)"
        @click:clear="clear"
      >
        <template #append-outer>
          <v-btn small :disabled="!isValidUrl || !value" icon :href="value" target="_blank">
            <v-icon>mdi-open-in-new</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropOptions } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'

export default Vue.extend({
  name: 'InputUri',
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
    isValidUrl(): boolean {
      return !(this.validation && this.validation.objectSchema && this.validation.objectSchema.errorMsg)
    }
  },
  methods: {
    clear() {
      // TODO: it needs two nested $nextTick()-s to work properly and update value to undefined.
      // Check if there is other easier way. This function is implemented  in all other FormElements. Check them also.
      this.$nextTick(() => this.$nextTick(() => this.$emit('input', undefined)))
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    // Add Number.EPSILON, because InputText must be PREFERRED as Default,
    // if other fields have the same number of true conditions
    // if other fields are appropriate, they MUST have more true conditions

    return calculateConditionsScore([props.schema.type === 'string', props.schema.format === 'uri'])
  }
}
</script>

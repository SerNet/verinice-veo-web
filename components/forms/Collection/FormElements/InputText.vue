<template>
  <div v-if="visible" class="vf-input-text">
    <ValidationProvider
      :name="options && options.label"
      :rules="validation"
      v-slot="{ errors }"
    >
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
      ></v-text-field>
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'
import { BaseObject, IApi } from '~/components/forms/utils'

export default Vue.extend({
  name: 'InputText',
  props: {
    name: String,
    schema: Object as Prop<JSONSchema7>,
    lang: Object as Prop<BaseObject>,
    options: Object,
    value: {},
    validation: Object,
    disabled: Boolean,
    visible: Boolean,
    api: Object as Prop<IApi>
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

    return calculateConditionsScore(
      [props.schema.type === 'string'],
      Number.EPSILON
    )
  }
}
</script>

<style scoped></style>

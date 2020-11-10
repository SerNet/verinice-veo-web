<template>
  <div v-if="visible" class="vf-checkbox vf-form-element">
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
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
import { Prop } from 'vue/types/options'
import { JSONSchema7 } from 'json-schema'
import { BaseObject, IApi } from '~/components/forms/utils'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'

export default Vue.extend({
  name: 'Checkbox',
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

<style lang="scss" scoped>
.vf-checkbox {
  display: inline-block;
}
</style>

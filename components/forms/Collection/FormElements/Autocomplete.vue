<template>
  <div>
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
      <v-autocomplete
        v-if="visible"
        :disabled="disabled"
        :value="value"
        :error-messages="errors[0]"
        :label="options && options.label"
        :items="items"
        :class="options && options.class"
        :style="options && options.style"
        :multiple="multiple"
        clearable
        @input="$emit('input', $event)"
        @change="$emit('input', $event)"
        @click:clear="clear"
      />
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7, JSONSchema7Type } from 'json-schema'
import { JsonPointer } from 'json-ptr'
import { BaseObject, IApi } from '~/components/forms/utils'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'

interface IItem {
  value: string | number | boolean
  text: string | number | boolean
}

export default Vue.extend({
  name: 'Autocomplete',
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
  computed: {
    isItemsWithCustomizedLabels(): boolean {
      return !!(this.options && Array.isArray(this.options.enum))
    },
    items(): IItem[] | undefined {
      if (this.schema.enum) {
        return this.generateItems(this.schema.enum)
      } else if (
        this.schema.items &&
        !Array.isArray(this.schema.items) &&
        this.schema.items instanceof Object &&
        this.schema.items.enum
      ) {
        return this.generateItems(this.schema.items.enum)
      } else {
        return undefined
      }
    },
    multiple() {
      return (
        this.schema.type === 'array' &&
        this.schema.items instanceof Object &&
        !Array.isArray(this.schema.items) &&
        typeof this.schema.items.enum !== 'undefined'
      )
    }
  },
  methods: {
    clear() {
      this.$nextTick(() => this.$nextTick(() => this.$emit('input', undefined)))
    },
    getCustomizedLabelItems(schemaEnum: JSONSchema7Type[]) {
      if (this.options && Array.isArray(this.options.enum)) {
        return schemaEnum.map((val: any, i: number) => ({
          value: val,
          text: this.options.enum[i]
        }))
      }
    },
    getTranslatedLabelItems(schemaEnum: JSONSchema7Type[]) {
      if (schemaEnum[0] && schemaEnum[0].toString().includes('#lang/')) {
        return schemaEnum.map((val: any) => {
          return {
            value: val,
            text: JsonPointer.get(this.lang, val.replace('#lang/', '#/'))
          }
        })
      } else {
        // The enum key name should be directly written in lang file
        return schemaEnum.map((val: any) => {
          return { value: val, text: (this.lang && this.lang[val]) || val }
        })
      }
    },
    generateItems(schemaEnum: JSONSchema7Type[]) {
      return this.isItemsWithCustomizedLabels
        ? this.getCustomizedLabelItems(schemaEnum)
        : this.getTranslatedLabelItems(schemaEnum)
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      typeof props.schema.type === 'undefined' ||
        props.schema.type === 'string' ||
        props.schema.type === 'array',
      typeof props.schema.enum !== 'undefined' ||
        (props.schema.items instanceof Object &&
          !Array.isArray(props.schema.items) &&
          typeof props.schema.items.enum !== 'undefined'),
      typeof props.options !== 'undefined' &&
        props.options.format === 'autocomplete'
    ])
  }
}
</script>

<style scoped></style>

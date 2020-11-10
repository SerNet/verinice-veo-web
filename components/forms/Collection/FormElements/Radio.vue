<template>
  <div v-if="visible" class="vf-radio">
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
      <div v-if="options && options.label" class="subtitle-1">
        {{ options && options.label }}
      </div>
      <v-radio-group
        :disabled="disabled"
        :value="value"
        :column="isDirectionVertical"
        :row="!isDirectionVertical"
        :error-messages="errors[0]"
        :class="options && options.class"
        :style="options && options.style"
        dense
        hide-details="auto"
        @input="$emit('input', $event)"
        @change="$emit('input', $event)"
      >
        <!-- Attention: ValidationProvider must wrap each element with ":value" property, else occures infinity loop error -->
        <ValidationProvider
          v-for="(item, i) in items"
          v-slot="{ errors }"
          :key="i"
          :name="item.value.toString()"
        >
          <v-radio :value="item.value" :label="item.text" color="primary" />
        </ValidationProvider>
        <div slot="append">
          <v-icon @click="clear">mdi-close</v-icon>
        </div>
      </v-radio-group>
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7, JSONSchema7Type } from 'json-schema'
import { JsonPointer } from 'json-ptr'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'
import { BaseObject, IApi } from '~/components/forms/utils'

interface IItem {
  value: string | number | boolean
  text: string | number | boolean
}

export default Vue.extend({
  name: 'Radio',
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
    radioValues(): JSONSchema7Type[] {
      return this.schema && this.schema.enum ? [...this.schema.enum] : []
    },
    radioLabels(): JSONSchema7Type[] {
      return this.options && this.options.enum
        ? [...this.options.enum]
        : [...this.radioValues]
    },
    isDirectionVertical(): boolean {
      return !(this.options && this.options.direction === 'horizontal')
    },
    isItemsWithCustomizedLabels(): boolean {
      return !!(this.options && Array.isArray(this.options.enum))
    },
    items(): IItem[] | undefined {
      if (this.schema.enum) {
        return this.generateItems(this.schema.enum)
      } else {
        return undefined
      }
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
        props.schema.type === 'string',
      typeof props.schema.enum !== 'undefined',
      typeof props.options !== 'undefined' && props.options.format === 'radio'
    ])
  }
}
</script>

<style scoped></style>

<template>
  <div v-if="visible" class="vf-radio vf-form-element">
    <ValidationProvider v-slot="{ errors }" :name="options && options.label" :rules="validation">
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
        <ValidationProvider v-for="(item, i) in items" v-slot="{}" :key="i" :name="item.value.toString()">
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
import { PropOptions } from 'vue/types/options'
import { JSONSchema7, JSONSchema7Type } from 'json-schema'
import { calculateConditionsScore, FormElementProps, Helpful } from '~/components/forms/Collection/utils/helpers'
import { IVeoFormSchemaTranslationCollectionItem, IVeoTranslation } from '~/types/VeoTypes'

interface IItem {
  value: string | number | boolean
  text: string | number | boolean
}

interface ITranslateLabelItem {
  value: string
  text: string
}

export default Vue.extend({
  name: 'Radio',
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
    generalTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoTranslation>,
    customTranslation: {
      type: Object,
      default: () => {}
    } as PropOptions<IVeoFormSchemaTranslationCollectionItem>,
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
    radioValues(): string[] {
      return (this.schema && this.schema.enum ? [...this.schema.enum] : []) as string[]
    },
    radioLabels(): string[] {
      return this.options && this.options.enum ? [...this.options.enum] : [...this.radioValues]
    },
    isDirectionVertical(): boolean {
      return this.options && this.options.direction === 'vertical'
    },
    isItemsWithCustomizedLabels(): boolean {
      return !!(this.options && Array.isArray(this.options.enum))
    },
    items(): IItem[] {
      if (this.schema.enum) {
        return this.generateItems(this.schema.enum as string[])
      } else {
        return []
      }
    }
  },
  methods: {
    clear() {
      this.$nextTick(() => this.$nextTick(() => this.$emit('input', undefined)))
    },
    getCustomizedLabelItems(schemaEnum: string[]) {
      if (this.options && Array.isArray(this.options.enum)) {
        return schemaEnum.map((val: any, i: number) => ({
          value: val,
          text: this.options.enum[i]
        }))
      } else {
        return []
      }
    },
    getTranslatedLabelItems(schemaEnum: string[]): ITranslateLabelItem[] {
      // The enum key name should be directly written in lang file
      return schemaEnum.map((translationKey: string) => {
        return {
          value: translationKey,
          text: this.customTranslation?.[translationKey] || this.generalTranslation?.[translationKey] || translationKey
        }
      })
    },
    generateItems(schemaEnum: string[]) {
      return this.isItemsWithCustomizedLabels
        ? this.getCustomizedLabelItems(schemaEnum)
        : this.getTranslatedLabelItems(schemaEnum)
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      typeof props.schema.type === 'undefined' || props.schema.type === 'string',
      typeof props.schema.enum !== 'undefined',
      typeof props.options !== 'undefined' && props.options.format === 'radio'
    ])
  }
}
</script>

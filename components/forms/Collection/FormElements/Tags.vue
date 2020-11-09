<template>
  <div v-if="visible" class="vf-tags">
    <ValidationProvider
      v-slot="{ errors }"
      :name="options && options.label"
      :rules="validation"
    >
      <v-combobox
        :disabled="disabled"
        :value="value"
        :error-messages="errors[0]"
        :label="options && options.label"
        :items="items"
        :class="options && options.class"
        :style="options && options.style"
        chips
        deletable-chips
        multiple
        clearable
        :return-object="false"
        @input="$emit('input', $event)"
        @change="$emit('input', $event)"
        @click:clear="clear"
      />
    </ValidationProvider>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
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
  name: 'Tags',
  props: {
    name: { type: String, default: '' },
    schema: { type: Object, default: undefined } as PropOptions<JSONSchema7>,
    lang: { type: Object, default: undefined } as PropOptions<BaseObject>,
    options: { type: Object, default: undefined },
    value: { type: undefined, default: undefined },
    validation: { type: Object, default: undefined },
    disabled: Boolean,
    visible: Boolean,
    api: { type: Object, default: undefined } as PropOptions<IApi>
  },
  computed: {
    isItemsWithCustomizedLabels(): boolean {
      return !!(this.options && Array.isArray(this.options.enum))
    },
    enum(): JSONSchema7Type[] | undefined {
      if (
        this.schema.items &&
        !Array.isArray(this.schema.items) &&
        this.schema.items instanceof Object &&
        typeof this.schema.items.anyOf !== 'undefined'
      ) {
        const objWithEnum = this.schema.items.anyOf.find(
          o => o instanceof Object && o.enum
        )
        if (objWithEnum instanceof Object && Array.isArray(objWithEnum.enum)) {
          return [...objWithEnum.enum]
        }
      }
      return undefined
    },
    items(): IItem[] | undefined {
      if (this.enum) {
        return this.generateItems(this.enum)
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
      props.schema.type === 'array',
      typeof props.options !== 'undefined' && props.options.format === 'tags'
    ])
  }
}
</script>

<style scoped></style>

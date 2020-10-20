<template>
  <div
    v-if="visible"
    class="vf-array-field"
    :class="options && options.class"
    :style="options && options.style"
  >
    <div v-if="options && options.label" class="subtitle-1 mb-2">
      {{ options && options.label }}
    </div>
    <div
      v-for="(val, i) in value"
      :key="i"
      class="d-flex flex-row"
      :style="[isDefaultRow[i] ? { opacity: 0.5 } : { opacity: 1 }]"
    >
      <VeoForm
        :schema="schema.items"
        :ui="ui"
        :value="value[i]"
        :lang="lang"
        :api="api"
        @input="onInput"
      />
      <v-btn
        dark
        fab
        x-small
        color="pink"
        class="vf-btn-remove ma-5 mt-4"
        @click="removeRow(i)"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>

    <v-btn color="primary" class="vf-btn-add mt-1" @click="addRow">Add</v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop } from 'vue/types/options'
import { JSONSchema7, JSONSchema7Type } from 'json-schema'
import { BaseObject, IApi } from '~/components/forms/utils'
import {
  calculateConditionsScore,
  FormElementProps,
  Helpful
} from '~/components/forms/Collection/utils/helpers'

export default Vue.extend({
  name: 'ArrayField',
  components: {
    // !!!IMPORTANT: this line makes sure, that VeoForm.vue component properly works in the project and in Rollup bundle
    VeoForm: async() => (await import('~/components/forms/VeoForm.vue')).default
  },
  props: {
    name: String,
    schema: Object as Prop<JSONSchema7>,
    lang: Object as Prop<BaseObject>,
    options: Object,
    elements: Array,
    value: {
      type: Array
      // default() {
      //   return Array.isArray(this.schema.default) &&
      //     this.schema.default.length > 0
      //     ? [{ ...this.schema.default[0] }]
      //     : [{}];
      // }
    },
    disabled: Boolean,
    visible: Boolean,
    api: Object as Prop<IApi>
  },
  computed: {
    ui() {
      return {
        type: 'Layout',
        options: {
          direction:
            this.options && this.options.direction === 'vertical'
              ? 'vertical'
              : 'horizontal',
          format: 'group'
        },
        elements: this.elements
      }
    },
    rowToAdd(): {} {
      return (
        typeof this.schema.items !== 'undefined' &&
        !Array.isArray(this.schema.items) &&
        typeof this.schema.items !== 'boolean' &&
        typeof this.schema.items.default !== 'undefined' &&
        this.schema.items.default !== null &&
        !Array.isArray(this.schema.items.default) &&
        this.schema.items.default instanceof Object && {
          ...this.schema.items.default
        }
      )
    },
    isDefaultRow(): boolean[] {
      return this.value.map(
        val => JSON.stringify(val) === JSON.stringify(this.rowToAdd)
      )
    }
  },
  methods: {
    addRow() {
      const value = this.value ? this.value : []
      value.push({ ...this.rowToAdd })
      this.$emit('input', value)
    },
    removeRow(rowIndex: number) {
      this.value.splice(rowIndex, 1)
      this.$emit('input', this.value)
    },
    onInput(event: any) {
      this.$emit('input', this.value)
    },
    isRowExist() {
      return this.value
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    return calculateConditionsScore([
      props.schema.type === 'array',
      typeof props.elements !== 'undefined'
    ])
  }
}
</script>

<style scoped>
.vf-array-field > div {
  transition: opacity 0.7s;
}
::v-deep .vf-control.col {
  padding: 0 5px 0 0;
}
</style>

<template>
  <div
    v-if="visible"
    class="vf-links-field"
    :class="options && options.class"
    :style="options && options.style"
  >
    <div v-if="options && options.label" class="subtitle-1 mb-2">
      {{ options && options.label }}
    </div>
    <div v-for="(val, i) in value" :key="i" class="d-flex flex-row align-center">
      <div class="d-inline-block" style="width: 32px">
        <v-btn v-if="i === value.length - 1" elevation="0" x-small text fab color="primary" @click="addRow">
          <v-icon>mdi-plus-circle-outline</v-icon>
        </v-btn>
      </div>
      <LinksFieldRow
        :key="i"
        :index="i"
        :name="name"
        :selected.sync="selected[i]"
        :schema="schema"
        :lang="lang"
        :options="options"
        :elements="elements"
        :validation="validation"
        :value="value[i]"
        :disabled="disabled"
        :visible="visible"
        :api="api"
        @input="onInput"
      />
      <v-btn
        dark
        elevation="0"
        x-small
        text
        fab
        color="primary"
        @click="removeRow(i)"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>
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

import LinksFieldRow from '~/components/forms/Collection/FormElements/LinksFieldRow.vue'

interface IData {
  selected: string[]
}

export default Vue.extend({
  name: 'LinksField',
  components: {
    LinksFieldRow
  },
  props: {
    name: String,
    schema: Object as Prop<JSONSchema7>,
    lang: Object as Prop<BaseObject>,
    options: Object,
    elements: Array,
    validation: Object,
    value: {
      type: Array as Prop<BaseObject[]>
    },
    disabled: Boolean,
    visible: Boolean,
    api: Object as Prop<IApi>
  },
  data(): IData {
    return {
      selected: []
    }
  },
  computed: {
    rowToAdd(): any {
      return {}
    }
  },
  mounted() {
    if (!this.value || this.value.length === 0) {
      this.addRow()
    }
  },
  methods: {
    addRow() {
      const value = this.value ? this.value : []
      value.push({ ...this.rowToAdd })
      this.$emit('input', value)
    },
    removeRow(rowIndex: number) {
      this.selected.splice(rowIndex, 1)
      this.value.splice(rowIndex, 1)
      this.$emit('input', this.value)
    },
    onInput(event: any) {
      this.$emit('input', this.value)
    }
  }
})

export const helpers: Helpful<FormElementProps> = {
  matchingScore(props) {
    const schemaItemsProperties =
      props.schema &&
      props.schema.items &&
      typeof props.schema.items === 'object' &&
      !Array.isArray(props.schema.items) &&
      props.schema.items.properties &&
      props.schema.items.properties
    const isTarget = !!(schemaItemsProperties && schemaItemsProperties.target)
    return calculateConditionsScore([
      props.schema.type === 'array',
      typeof props.elements !== 'undefined',
      isTarget
    ])
  }
}
</script>

<style lang="scss" scoped>
::v-deep .vf-control.col {
  padding: 0 5px 0 0;
}
</style>
